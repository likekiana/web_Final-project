"""
AI助手应用服务层
"""

import re
import time
import jieba
import requests
from datetime import datetime
from django.db.models import Q

# 尝试导入sklearn，如果不可用则使用备选方案
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# 导入Post模型
from content.models import Post

from .models import KnowledgeBase, AIResponseLog

# DeepSeek API配置
DEEPSEEK_API_KEY = "sk-56736dc0776f4b12bf7e05a7de735d0e"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"


class AIAssistantService:
    """AI助手核心服务类"""
    
    def __init__(self):
        # 初始化停用词列表
        self.stopwords = self._load_stopwords()
    
    def _call_deepseek_api(self, messages, temperature=0.7, max_tokens=1024):
        """
        调用DeepSeek API生成AI回复
        
        Args:
            messages: 聊天消息列表
            temperature: 生成温度，控制随机性
            max_tokens: 最大生成令牌数
        
        Returns:
            str: AI生成的回复
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
        }
        
        payload = {
            "model": DEEPSEEK_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            # 如果API调用失败，返回空字符串或备用回复
            print(f"DeepSeek API调用失败: {e}")
            return ""
        
    def _load_stopwords(self):
        """加载停用词列表"""
        try:
            with open('ai_assistant/stopwords.txt', 'r', encoding='utf-8') as f:
                stopwords = [line.strip() for line in f if line.strip()]
        except FileNotFoundError:
            # 默认停用词
            stopwords = [
                '的', '了', '和', '是', '在', '我', '有', '不', '这', '人', '都', '一', '一个', '上',
                '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己',
                '就', '我们', '来', '喜欢', '出', '上', '下', '进', '出', '给', '对', '能', '而'
            ]
        return stopwords
    
    def _preprocess_text(self, text):
        """文本预处理：分词、去除停用词"""
        # 去除特殊字符
        text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9]', ' ', text)
        # 分词
        words = jieba.cut(text)
        # 去除停用词
        filtered_words = [word for word in words if word not in self.stopwords and len(word) > 1]
        return ' '.join(filtered_words)
    
    def _calculate_similarity(self, text1, text2):
        """计算文本相似度"""
        # 预处理文本
        text1_processed = self._preprocess_text(text1)
        text2_processed = self._preprocess_text(text2)
        
        if not text1_processed or not text2_processed:
            return 0.0
        
        # 如果sklearn可用，使用TF-IDF计算相似度
        if SKLEARN_AVAILABLE:
            # 使用TF-IDF计算相似度
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform([text1_processed, text2_processed])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity
        else:
            # 如果sklearn不可用，使用简单的关键词匹配
            words1 = set(text1_processed.split())
            words2 = set(text2_processed.split())
            
            if not words1 or not words2:
                return 0.0
            
            # 计算Jaccard相似度
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            similarity = intersection / union
            return similarity
    
    def get_knowledge_answer(self, user_question):
        """
        从知识库和帖子中获取答案
        
        Args:
            user_question: 用户输入的问题
        
        Returns:
            dict: 包含答案、相似度和响应类型的字典
        """
        start_time = time.time()
        
        # 1. 首先搜索帖子数据库
        best_post_match = None
        highest_post_similarity = 0.0
        
        # 获取所有正常状态的帖子
        posts = Post.objects.filter(status='normal')
        
        # 计算每个帖子的相似度
        for post in posts:
            # 计算与标题的相似度
            title_similarity = self._calculate_similarity(user_question, post.title)
            # 计算与内容的相似度
            content_similarity = self._calculate_similarity(user_question, post.content)
            # 综合相似度（标题权重更高）
            total_similarity = (title_similarity * 0.7) + (content_similarity * 0.3)
            
            # 如果相似度超过阈值，更新最佳匹配
            if total_similarity > highest_post_similarity:
                highest_post_similarity = total_similarity
                best_post_match = post
        
        # 帖子相似度阈值
        post_similarity_threshold = 0.4
        
        # 如果找到匹配的帖子且相似度超过阈值
        if best_post_match and highest_post_similarity >= post_similarity_threshold:
            # 生成基于帖子的回答
            post_answer = f"根据帖子《{best_post_match.title}》：\n\n{best_post_match.content[:200]}...\n\n（答案来自帖子ID：{best_post_match.id}）"
            
            # 计算处理时间
            processing_time = int((time.time() - start_time) * 1000)
            
            # 保存响应日志
            AIResponseLog.objects.create(
                user_input=user_question,
                ai_response=post_answer,
                response_type=AIResponseLog.ResponseType.POST_BASED,
                similarity_score=highest_post_similarity,
                processing_time=processing_time
            )
            
            return {
                'answer': post_answer,
                'response_type': AIResponseLog.ResponseType.POST_BASED,
                'similarity': highest_post_similarity,
                'processing_time': processing_time
            }
        
        # 2. 如果没有找到合适的帖子，再搜索知识库
        knowledge_items = KnowledgeBase.objects.filter(is_active=True)
        
        best_knowledge_match = None
        highest_knowledge_similarity = 0.0
        
        # 计算每个知识库条目的相似度
        for item in knowledge_items:
            # 计算问题相似度
            question_similarity = self._calculate_similarity(user_question, item.question)
            
            # 检查关键词匹配
            keyword_match = False
            user_words = set(self._preprocess_text(user_question).split())
            item_keywords = set(item.keywords)
            if user_words.intersection(item_keywords):
                keyword_match = True
                # 关键词匹配增加相似度权重
                question_similarity = max(question_similarity, 0.5)
            
            # 如果相似度超过阈值，更新最佳匹配
            if question_similarity > highest_knowledge_similarity:
                highest_knowledge_similarity = question_similarity
                best_knowledge_match = item
        
        # 知识库相似度阈值
        knowledge_similarity_threshold = 0.3
        
        response_data = {
            'answer': '',
            'similarity': highest_knowledge_similarity,
            'response_type': AIResponseLog.ResponseType.KNOWLEDGE_BASE,
            'knowledge_item': best_knowledge_match
        }
        
        # 如果找到匹配的知识库条目且相似度超过阈值
        if best_knowledge_match and highest_knowledge_similarity >= knowledge_similarity_threshold:
            # 增加热度计数
            best_knowledge_match.increment_popularity()
            response_data['answer'] = f"{best_knowledge_match.answer}\n\n（答案来自知识库）"
        else:
            # 3. 没有找到匹配的帖子或知识库条目，使用AI生成回复
            ai_answer = self._generate_ai_response(user_question)
            response_data['answer'] = f"{ai_answer}\n\n（答案由AI生成）"
            response_data['response_type'] = AIResponseLog.ResponseType.AI_GENERATED
        
        # 计算处理时间
        processing_time = int((time.time() - start_time) * 1000)
        
        # 保存响应日志
        AIResponseLog.objects.create(
            user_input=user_question,
            ai_response=response_data['answer'],
            response_type=response_data['response_type'],
            knowledge_base=response_data['knowledge_item'],
            similarity_score=response_data['similarity'],
            processing_time=processing_time
        )
        
        return {
            'answer': response_data['answer'],
            'response_type': response_data['response_type'],
            'similarity': response_data['similarity'],
            'processing_time': processing_time
        }
    
    def _generate_ai_response(self, user_question):
        """
        生成AI回复（使用DeepSeek API）
        
        Args:
            user_question: 用户输入的问题
        
        Returns:
            str: AI生成的回复
        """
        messages = [
            {
                "role": "system",
                "content": "你是一个校园AI助手，专门回答关于校园生活、学习、活动等方面的问题。请使用简洁、友好的语言回答用户问题，提供准确有用的信息。"
            },
            {
                "role": "user",
                "content": user_question
            }
        ]
        
        ai_response = self._call_deepseek_api(messages)
        
        # 如果API调用失败，返回备用回复
        if not ai_response:
            return "抱歉，我暂时无法回答这个问题。请您尝试提供更详细的信息，或联系学校相关部门咨询。"
        
        return ai_response
    
    def generate_post_title(self, content):
        """
        生成帖子标题（使用DeepSeek API）
        
        Args:
            content: 帖子内容
        
        Returns:
            str: 生成的帖子标题
        """
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的标题生成器，请根据提供的帖子内容生成一个简洁、吸引人的标题，不超过50个字符。标题应准确反映帖子的核心内容，语言生动有力。"
            },
            {
                "role": "user",
                "content": f"请为以下帖子内容生成一个合适的标题：\n{content}"
            }
        ]
        
        ai_title = self._call_deepseek_api(messages, temperature=0.8, max_tokens=100)
        
        # 如果API调用失败，使用备用方法
        if not ai_title:
            if len(content) < 10:
                return content[:50] if len(content) > 50 else content
            
            title = content[:50]
            sentence_endings = ['.', '!', '?', '。', '！', '？', '\n']
            for ending in sentence_endings:
                if ending in title:
                    title = title.split(ending)[0] + ending
                    break
            return title
        
        return ai_title
    
    def generate_post_summary(self, content):
        """
        生成帖子摘要（使用DeepSeek API）
        
        Args:
            content: 帖子内容
        
        Returns:
            str: 生成的帖子摘要
        """
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的内容摘要生成器，请根据提供的帖子内容生成一个简洁、准确的摘要，不超过150个字符。摘要应概括帖子的主要内容和核心观点，语言流畅自然。"
            },
            {
                "role": "user",
                "content": f"请为以下帖子内容生成一个合适的摘要：\n{content}"
            }
        ]
        
        ai_summary = self._call_deepseek_api(messages, temperature=0.6, max_tokens=200)
        
        # 如果API调用失败，使用备用方法
        if not ai_summary:
            if len(content) <= 100:
                return content
            
            summary = content[:100]
            sentence_endings = ['.', '!', '?', '。', '！', '？']
            for ending in reversed(sentence_endings):
                if ending in summary:
                    summary = summary[:summary.rfind(ending) + 1]
                    break
            return summary + '...'
        
        return ai_summary
    
    def expand_post_content(self, keywords, category):
        """
        根据关键词扩展帖子内容（使用DeepSeek API）
        
        Args:
            keywords: 关键词列表
            category: 帖子分类
        
        Returns:
            str: 扩展后的帖子内容
        """
        messages = [
            {
                "role": "system",
                "content": f"你是一个专业的内容创作者，请根据提供的关键词和分类，生成一篇结构完整、内容丰富的帖子。帖子分类为'{category}'，请确保内容符合该分类的特点和要求。\n\n要求：\n1. 内容结构清晰，有开头、主体和结尾\n2. 内容详实，逻辑连贯，语言流畅\n3. 结合关键词展开，确保每个关键词都能自然融入内容\n4. 适合发布在校园论坛或社区，风格亲切自然\n5. 字数控制在300-500字之间"
            },
            {
                "role": "user",
                "content": f"请根据以下关键词和分类生成一篇帖子：\n分类：{category}\n关键词：{'、'.join(keywords)}"
            }
        ]
        
        ai_content = self._call_deepseek_api(messages, temperature=0.8, max_tokens=800)
        
        # 如果API调用失败，使用备用方法
        if not ai_content:
            base_content = f"根据关键词{'、'.join(keywords)}，为您提供{category}相关内容：\n\n"
            
            expanded_content = {
                '学习资料': "这些学习资料涵盖了该领域的核心知识点，包括基础概念、实用技巧和进阶内容。建议您按照从基础到进阶的顺序学习，结合实际案例进行实践，以加深理解。\n\n学习过程中，您可以：\n1. 制定合理的学习计划\n2. 做好笔记和总结\n3. 多做练习和项目\n4. 与同学交流讨论\n5. 定期复习巩固",
                '活动通知': "本次活动旨在为大家提供一个交流互动的平台，丰富校园生活。活动将包括多种形式，如讲座、工作坊、比赛等，内容丰富多样，适合不同兴趣爱好的同学参与。\n\n活动详情：\n- 时间：待定\n- 地点：待定\n- 参与对象：全体师生\n- 报名方式：线上报名\n\n欢迎大家积极参与！",
                '校园新闻': "这是一则重要的校园新闻，涉及学校的最新发展和重要决策。学校一直致力于为师生提供更好的学习和生活环境，不断推进各项改革和发展。\n\n我们将持续关注相关动态，及时为大家带来最新资讯。",
                '其他': "根据您提供的关键词，为您整理了相关内容。希望这些信息对您有所帮助。如果您需要更详细的信息，请提供更多具体要求。\n\n祝您学习进步，生活愉快！"
            }
            
            return base_content + expanded_content.get(category, expanded_content['其他'])
        
        return ai_content
    
    def enhanced_search(self, query, category=None):
        """
        增强搜索功能（使用DeepSeek API）
        
        Args:
            query: 搜索查询
            category: 搜索分类（可选）
        
        Returns:
            dict: 包含搜索建议和优化查询的字典
        """
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的搜索优化助手，请根据用户的搜索查询和可选分类，生成优化后的查询和相关搜索建议。\n\n要求：\n1. 优化后的查询应更加精准，包含核心关键词\n2. 生成4个相关的搜索建议，每个建议应具体且有用\n3. 建议格式：['建议1', '建议2', '建议3', '建议4']\n4. 关键词列表：提取查询中的核心关键词，格式：['关键词1', '关键词2', ...]\n5. 请严格按照JSON格式返回结果，不要添加任何额外说明"
            },
            {
                "role": "user",
                "content": f"请优化以下搜索查询并生成相关建议：\n查询：{query}\n分类：{category if category else '无'}"
            }
        ]
        
        ai_result = self._call_deepseek_api(messages, temperature=0.6, max_tokens=200)
        
        # 如果API调用失败，使用备用方法
        if not ai_result:
            search_terms = self._preprocess_text(query).split()
            
            # 生成搜索建议
            suggestions = [
                f"{query} 相关资料",
                f"{query} 最新资讯",
                f"{query} 常见问题",
                f"{query} 经验分享"
            ]
            
            # 如果提供了分类，生成更具体的建议
            if category:
                suggestions = [
                    f"{category} {term}" for term in search_terms[:2]
                ]
            
            return {
                'original_query': query,
                'optimized_query': ' '.join(search_terms),
                'suggestions': suggestions,
                'search_terms': search_terms
            }
        
        try:
            # 尝试解析AI返回的JSON结果
            import json
            result_dict = json.loads(ai_result)
            return result_dict
        except Exception as e:
            # 如果解析失败，使用备用方法
            print(f"解析DeepSeek API结果失败: {e}")
            search_terms = self._preprocess_text(query).split()
            return {
                'original_query': query,
                'optimized_query': ' '.join(search_terms),
                'suggestions': [f"{query} 相关内容", f"{query} 更多信息"],
                'search_terms': search_terms
            }


# 创建全局服务实例
ai_assistant_service = AIAssistantService()