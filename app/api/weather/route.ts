import { NextResponse } from 'next/server'

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY
const DEFAULT_LAT = 34.0522 // Los Angeles
const DEFAULT_LON = -118.2437

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat') || DEFAULT_LAT
    const lon = searchParams.get('lon') || DEFAULT_LON

    if (!OPENWEATHERMAP_API_KEY) {
      // Return mock data if API key not configured
      return NextResponse.json({
        temp: 72,
        humidity: 45,
        uvIndex: 6,
        condition: 'Clear',
        icon: '01d'
      })
    }

    // Fetch current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`
    )

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const weatherData = await weatherResponse.json()

    // Fetch UV index from One Call API
    const uvResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}`
    )

    let uvIndex = 5 // Default UV index
    if (uvResponse.ok) {
      const uvData = await uvResponse.json()
      uvIndex = Math.round(uvData.value)
    }

    return NextResponse.json({
      temp: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      uvIndex,
      condition: weatherData.weather[0].main,
      icon: weatherData.weather[0].icon
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
