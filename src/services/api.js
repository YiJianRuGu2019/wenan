// Deepseek API 接口封装
const apiClient = {
  post: async (url, data) => {
    try {
      // Deepseek API URL 和认证信息
      const deepseekUrl = 'https://api.deepseek.com/v1/chat/completions';

      const response = await fetch(deepseekUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VUE_APP_DEEPSEEK_API_KEY || ''}`,
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};

// 文案生成功能
export const generateVideoScript = async (params) => {
  // 开发环境使用模拟数据
  if (process.env.NODE_ENV === 'development' && !process.env.VUE_APP_USE_REAL_API) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `方案一：
简约时尚的护肤品推广文案

护肤不应该是复杂的过程。这款全新的保湿精华，只需一滴，就能为肌肤注入持久水润。它的配方富含透明质酸和维生素E，适用于各种肤质。清爽不黏腻的质地，让肌肤呼吸自如。在临睡前使用，醒来即可感受到柔软细腻的触感。无香精无酒精，温和呵护敏感肌肤。现在购买，立享8折优惠，更有精美礼盒相送。为什么不给自己的肌肤最好的呵护呢？

===方案分隔线===

方案二：
打造水润肌肤的秘密武器

还在为干燥的肌肤烦恼吗？这款保湿精华是您的解救方案！每一滴都蕴含深海藻类精华，能够深入肌肤底层，锁住水分长达48小时。它的分子结构极小，吸收迅速，不会造成任何负担。使用后，肌肤立刻变得饱满有弹性，仿佛喝饱了水的海绵。连续使用两周，细纹明显减少，皮肤质地更加细腻。我们的产品通过了皮肤科医生的严格测试，安全有效。现在下单，即可享受买二赠一的限时活动。拥有水润肌肤，就从现在开始！

===方案分隔线===

方案三：
每一滴，都是对肌肤的宠爱

您是否曾经尝试过无数护肤品，却始终找不到真正适合自己的？这款多效合一的保湿精华，将彻底改变您的护肤体验。它不仅保湿，还能修复、紧致、抗氧化，一瓶顶四瓶。特别添加的珍稀植物提取物，能够激活肌肤自身的修复能力，让您的肌肤逐渐恢复年轻态。不含任何刺激性成分，即使是最敏感的肌肤也能安心使用。我们坚信：真正好的护肤品，应该是简单而有效的。现在扫码关注我们的官方账号，即可获得免费试用的机会。给您的肌肤一次重生的机会，您值得拥有！`
        });
      }, 1500);
    });
  }

  // 构建发送到Deepseek的提示词
  const systemPrompt = `你是一位专业的短视频文案策划师，擅长创作有吸引力、节奏感强的短视频文案。
请根据用户提供的内容，创作三个不同风格的短视频文案方案，满足以下要求：

1. 每个方案都是一段连续的、流畅的文案内容，不要分成多个分镜头
2. 每个方案的开头标明"方案X："（X为方案编号）并附上一个简短的标题
3. 不同方案之间用===方案分隔线===区分
4. 每个方案的长度控制在${params.length === 1 ? '100-150' : params.length === 2 ? '150-250' : '250-350'}字左右
5. 风格要${params.style}，针对${params.ageRange}岁${params.gender}受众
6. 文案类型是${params.type}
7. 重要提示：不要以场景或分镜的格式来组织文案，只需要写出完整连贯的文字内容`;

  const userMessage = params.content;

  try {
    // 调用Deepseek API
    const response = await apiClient.post('/chat/completions', {
      model: "deepseek-chat", // 使用Deepseek的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // 提取生成的文案内容
    return {
      text: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Failed to generate script with Deepseek:', error);
    throw error;
  }
};

export default apiClient; 