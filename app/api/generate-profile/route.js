import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIインスタンスを遅延初期化（ビルド時エラーを防ぐ）
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。環境変数 OPENAI_API_KEY を設定してください。');
  }
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function POST(req) {
  try {
    const { occupation, target, strengths } = await req.json();

    if (!occupation || !target || !strengths) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `あなたはプロフィールLP作成の専門家です。以下の情報を基に、魅力的なプロフィールLPのコンテンツを生成してください。

職業: ${occupation}
ターゲット: ${target}
強み: ${strengths}

以下のJSON形式で返答してください：
{
  "catchphrase": "キャッチコピー（30文字以内）",
  "introduction": "自己紹介文（200文字程度）",
  "recommendedLinks": [
    {"label": "リンク名", "url": "https://example.com", "style": ""},
    {"label": "リンク名", "url": "https://example.com", "style": ""}
  ]
}`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたはプロフィールLP作成の専門家です。JSON形式で返答してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    console.log('[AI生成] OpenAI APIからの生の応答:', content);
    
    if (!content) {
      return NextResponse.json(
        { error: 'AIからの応答が空でした。もう一度お試しください。' },
        { status: 500 }
      );
    }
    
    // JSONを抽出（```json で囲まれている場合がある）
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
      console.log('[AI生成] パース成功:', result);
    } catch (parseError) {
      console.error('[AI生成] JSON Parse Error:', parseError);
      console.error('[AI生成] Content:', content);
      return NextResponse.json(
        { error: 'AIからの応答の解析に失敗しました。もう一度お試しください。' },
        { status: 500 }
      );
    }

    const response = {
      catchphrase: result.catchphrase || '',
      introduction: result.introduction || '',
      recommendedLinks: result.recommendedLinks || [],
    };
    
    console.log('[AI生成] 最終レスポンス:', response);

    return NextResponse.json(response);
  } catch (err) {
    console.error('OpenAI API Error:', err);
    
    // エラータイプに応じたメッセージを返す
    let errorMessage = 'AI生成に失敗しました';
    if (err.message?.includes('API key') || err.message?.includes('APIキーが設定されていません')) {
      errorMessage = 'OpenAI APIキーが設定されていません。管理者にお問い合わせください。';
    } else if (err.message?.includes('rate limit')) {
      errorMessage = 'APIの利用制限に達しました。しばらく待ってから再度お試しください。';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

