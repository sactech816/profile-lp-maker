import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    
    // JSONを抽出（```json で囲まれている場合がある）
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    const result = JSON.parse(jsonStr);

    return NextResponse.json({
      catchphrase: result.catchphrase || '',
      introduction: result.introduction || '',
      recommendedLinks: result.recommendedLinks || [],
    });
  } catch (err) {
    console.error('OpenAI API Error:', err);
    return NextResponse.json(
      { error: err.message || 'AI生成に失敗しました' },
      { status: 500 }
    );
  }
}

