import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // default to today's date if not provided
  let date = searchParams.get('date');
  if (!date) {
    const today = new Date();
    // Convert to KST (UTC+9)
    const kstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    date = kstDate.toISOString().slice(0, 10).replace(/-/g, '');
  }

  const officeCode = process.env.ATPT_OFCDC_SC_CODE;
  const schoolCode = process.env.SD_SCHUL_CODE;
  const apiKey = process.env.NEIS_API_KEY;

  if (!officeCode || !schoolCode || !apiKey) {
    return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
  }

  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${apiKey}&Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
      return NextResponse.json({ error: data.RESULT.MESSAGE }, { status: 400 });
    }

    if (!data.mealServiceDietInfo) {
      return NextResponse.json({ menu: [] });
    }

    const mealData = data.mealServiceDietInfo[1].row[0]; // get the first meal (usually lunch)
    const rawMenu = mealData.DDISH_NM as string;
    
    // 1. Split by <br/> tag
    // 2. Remove allergy numbers e.g., 1.2.5. or (1)
    // 3. Trim whitespace
    const menuList = rawMenu
        .split('<br/>')
        .map(item => {
          // Removes patterns like " 1.2." or "(1,2)" or "*"
          return item.replace(/[\d\.]+/g, '').replace(/\*/g, '').replace(/[\(\)]/g, '').trim();
        })
        .filter(item => item.length > 0);

    return NextResponse.json({ 
      date: mealData.MLSV_YMD,
      menu: menuList,
      calories: mealData.CAL_INFO 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meal data' }, { status: 500 });
  }
}
