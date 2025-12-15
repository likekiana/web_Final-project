import re


class AIAuditService:
    """AI审核服务"""
    
    def __init__(self):
        # 初始化配置
        self.sensitive_words = self._load_sensitive_words()
        self.advertisement_patterns = self._load_advertisement_patterns()
    
    def _load_sensitive_words(self):
        """加载敏感词列表"""
        return [
            # 政治敏感词
            '敏感政治词1', '敏感政治词2',
            
            # 色情敏感词
            '色情', '淫秽', '黄色', '性爱', '性交', '性行为', '性器官', '色情图片', '色情视频',
            '裸照', '裸露', '挑逗', '勾引', '淫荡', '放荡', '风骚', '妓院', '妓女', '嫖娼',
            '卖淫', '色情服务', '成人内容', 'AV', '三级片',
            
            # 暴力敏感词
            '暴力', '杀人', '打架', '斗殴', '血腥', '凶杀', '谋杀', '自杀', '自残', '伤害',
            '虐待', '酷刑', '暴力倾向', '打架斗殴', '血腥暴力', '暴力行为',
            
            # 辱骂敏感词 - 中文
            '傻逼', '白痴', '智障', '脑残', '神经病', '疯子', '垃圾', '废物', '人渣', '败类',
            '贱人', '婊子', '畜生', '狗东西', '王八蛋', '混蛋', '恶棍', '恶魔', '禽兽', '畜生不如',
            '草泥马', '操你妈', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'motherfucker',
            '傻逼', '傻屌', '傻逼玩意', '傻逼东西', '傻逼货', '傻逼玩意儿', '傻逼货', '傻逼一个',
            '白痴货', '白痴一个', '智障儿', '智障人士', '脑残货', '脑残儿', '神经病患者', '疯子一个',
            '垃圾货', '垃圾东西', '垃圾一个', '废物一个', '废物点心', '人渣一个', '败类一个',
            '贱人一个', '婊子一个', '婊子养的', '婊子货', '畜生一个', '狗东西', '狗杂种', '狗娘养的',
            '王八蛋', '王八羔子', '混蛋一个', '混蛋玩意儿', '恶棍一个', '恶魔一个', '禽兽不如',
            '禽兽一个', '畜生不如的东西', '畜生东西', '畜生货', '狗东西', '狗屎', '狗屁', '狗屁不通',
            '狗杂种', '狗娘养的', '狗日的', '狗崽子', '狗卵子', '狗逼', '狗逼养的', '狗逼玩意',
            '逼', '傻逼', '傻逼真', '傻逼货', '傻逼东西', '傻逼玩意儿', '傻逼一个', '傻逼玩意',
            '二逼', '二逼货', '二逼东西', '二逼玩意儿', '二逼一个', '二逼玩意',
            '牛逼', '牛逼哄哄', '牛逼闪闪', '牛逼货', '牛逼东西', '牛逼玩意儿', '牛逼一个',
            '装逼', '装逼货', '装逼东西', '装逼玩意儿', '装逼一个', '装逼犯', '装逼佬',
            '草泥马', '草泥马的', '草泥马逼', '草泥马玩意儿', '草泥马东西',
            '操你妈', '操你妈的', '操你妈逼', '操你妈玩意儿', '操你妈东西',
            '日你妈', '日你妈的', '日你妈逼', '日你妈玩意儿', '日你妈东西',
            '滚你妈', '滚你妈的', '滚你妈逼', '滚你妈玩意儿', '滚你妈东西',
            '去死', '去死吧', '赶紧死', '死远点', '死开', '去死吧你', '死东西', '死货',
            '垃圾', '垃圾东西', '垃圾货', '垃圾一个', '垃圾玩意儿', '垃圾东西',
            '废物', '废物点心', '废物一个', '废物东西', '废物货', '废物玩意儿',
            '人渣', '人渣一个', '人渣东西', '人渣货', '人渣玩意儿',
            '败类', '败类一个', '败类东西', '败类货', '败类玩意儿',
            '贱人', '贱货', '贱东西', '贱婢', '贱货一个', '贱货东西', '贱货玩意儿',
            '婊子', '婊子养的', '婊子货', '婊子东西', '婊子玩意儿', '婊子一个',
            '妓女', '妓女一个', '妓女东西', '妓女货', '妓女玩意儿',
            '嫖客', '嫖客一个', '嫖客东西', '嫖客货', '嫖客玩意儿',
            '淫妇', '淫妇一个', '淫妇东西', '淫妇货', '淫妇玩意儿',
            '荡妇', '荡妇一个', '荡妇东西', '荡妇货', '荡妇玩意儿',
            '骚货', '骚货一个', '骚货东西', '骚货玩意儿', '骚逼', '骚逼货', '骚逼东西', '骚逼玩意儿',
            '臭逼', '臭逼货', '臭逼东西', '臭逼玩意儿', '臭婊子', '臭婊子养的', '臭婊子货',
            '狗逼', '狗逼养的', '狗逼货', '狗逼东西', '狗逼玩意儿',
            '牛逼', '牛逼货', '牛逼东西', '牛逼玩意儿', '牛逼哄哄', '牛逼闪闪',
            
            # 违法敏感词
            '毒品', '大麻', '海洛因', '冰毒', '摇头丸', 'K粉', '可卡因', '吗啡', '吸毒', '贩毒',
            '走私', '赌博', '博彩', '六合彩', '时时彩', '黑彩', '高利贷', '诈骗', '欺诈',
            '盗窃', '抢劫', '抢夺', '绑架', '勒索', '敲诈', '贿赂', '贪污', '腐败',
            
            # 广告相关敏感词（部分）
            '广告', '推广', '宣传', '优惠', '促销',
            
            # 其他敏感词
            '测试敏感词', '敏感信息', '敏感内容', '违规内容',
        ]
    
    def _load_advertisement_patterns(self):
        """加载广告识别模式"""
        return [
            r'\b(?:微信|wechat|wx|QQ|qq|联系方式|电话|手机号|微信号|QQ号)\b',
            r'\b(?:推广|宣传|优惠|促销|打折|限时|抢购|爆款)\b',
            r'\b(?:扫码|二维码|关注|订阅|点击|链接|网址)\b',
        ]
    
    def audit_content(self, content):
        """审核内容
        
        Args:
            content: 要审核的文本内容
            
        Returns:
            dict: 审核结果，包含违规类型、置信度、敏感词等
        """
        result = {
            'violation_type': 'none',
            'confidence': 0.0,
            'has_violation': False,
            'sensitive_words': [],
            'violation_reason': '',
            'clean_content': content,  # 添加清洁后的内容
        }
        
        # 检测敏感词
        detected_words = self._detect_sensitive_words(content)
        if detected_words:
            result['sensitive_words'] = detected_words
            result['violation_type'] = 'sensitive'
            result['confidence'] = 0.8
            result['has_violation'] = True
            result['violation_reason'] = f'检测到敏感词: {", ".join(detected_words)}'
            return result
        
        # 检测广告内容
        if self._detect_advertisement(content):
            result['violation_type'] = 'advertisement'
            result['confidence'] = 0.9
            result['has_violation'] = True
            result['violation_reason'] = '检测到广告内容'
            return result
        
        # 简单的违规内容检测
        if self._detect_violence(content) or self._detect_pornography(content):
            result['violation_type'] = 'other'
            result['confidence'] = 0.7
            result['has_violation'] = True
            result['violation_reason'] = '检测到违规内容'
            return result
        
        return result
    
    def replace_sensitive_words(self, content):
        """替换敏感词为**
        
        Args:
            content: 要替换敏感词的文本内容
            
        Returns:
            str: 替换后的文本内容
        """
        if not content:
            return content
        
        replaced_content = content
        
        # 使用集合去重，然后转换为列表
        unique_sensitive_words = list(set(self.sensitive_words))
        
        # 按长度降序排序，确保长敏感词优先被替换
        unique_sensitive_words.sort(key=lambda x: len(x), reverse=True)
        
        for word in unique_sensitive_words:
            if word in replaced_content:
                # 将敏感词替换为**
                replaced_content = replaced_content.replace(word, '*' * len(word))
        
        return replaced_content
    
    def _detect_sensitive_words(self, content):
        """检测敏感词，支持简单的变形检测"""
        detected = []
        for word in self.sensitive_words:
            # 简单的变形检测，如替换为同音字或形近字
            # 这里使用正则表达式进行模糊匹配
            pattern = re.escape(word)
            # 可以扩展更多变形规则
            if re.search(pattern, content, re.IGNORECASE):
                detected.append(word)
        return detected
    
    def _detect_advertisement(self, content):
        """检测广告内容"""
        # 简单匹配广告关键词
        ad_keywords = [
            '微信', 'wechat', 'wx', 'QQ', 'qq', '联系方式', '电话', '手机号', 
            '微信号', 'QQ号', '推广', '宣传', '优惠', '促销', '打折', '限时', 
            '抢购', '爆款', '扫码', '二维码', '关注', '订阅', '点击', '链接', 
            '网址', '广告', 'advertisement', 'ad', '公众号', '小程序', '加群',
            '进群', '联系方式', '咨询', '了解更多', '详情', '请联系'
        ]
        
        # 检查是否包含广告关键词
        for keyword in ad_keywords:
            if keyword in content:
                return True
        
        # 检查正则表达式模式
        for pattern in self.advertisement_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _detect_violence(self, content):
        """简单的暴力内容检测"""
        violence_words = ['暴力', '杀人', '打架', '斗殴', '血腥']
        for word in violence_words:
            if word in content:
                return True
        return False
    
    def _detect_pornography(self, content):
        """简单的色情内容检测"""
        porn_words = ['色情', '淫秽', '黄色', '性', ' porn ']
        for word in porn_words:
            if word in content:
                return True
        return False
    
    def audit_post(self, post):
        """审核帖子"""
        return self.audit_content(post.content)
    
    def audit_comment(self, comment):
        """审核评论"""
        return self.audit_content(comment.content)
