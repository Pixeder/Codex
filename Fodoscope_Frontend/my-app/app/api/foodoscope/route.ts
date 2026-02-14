import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const min = searchParams.get('min') || '0';
  const max = searchParams.get('max') || '1000';
  const limit = searchParams.get('limit') || '12';

  // Securely stored token (Move to .env in production)
  const API_TOKEN = "p-jmMdgFsUrJOAvL8LJbY6yG2b1Vvn_-1hBx2iptZS0Kb-7_";

  let url = "";
  
  // Route the request to the correct Foodoscope endpoint
  switch (type) {
    case 'rotd':
      url = 'https://api.foodoscope.com/recipe2-api/recipe/recipeofday';
      break;
    case 'protein':
      url = `https://api.foodoscope.com/recipe2-api/protein/protein-range?min=${min}&max=${max}&page=1&limit=${limit}`;
      break;
    case 'carb':
      url = `https://api.foodoscope.com/recipe2-api/recipe-carbo/recipes-by-carbs?minCarbs=${min}&maxCarbs=${max}&limit=${limit}`;
      break;
    case 'calorie':
      url = `https://api.foodoscope.com/recipe2-api/recipes-calories/calories?minCalories=${min}&maxCalories=${max}&limit=${limit}`;
      break;
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: `API Error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}