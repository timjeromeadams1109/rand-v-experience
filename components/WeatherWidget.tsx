'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, Droplets, Wind } from 'lucide-react'
import { getWeatherRecommendation } from '@/lib/utils'

interface WeatherData {
  temp: number
  humidity: number
  uvIndex: number
  condition: string
  icon: string
}

interface WeatherWidgetProps {
  className?: string
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch('/api/weather')
        if (!response.ok) throw new Error('Failed to fetch weather')
        const data = await response.json()
        setWeather(data)
        setRecommendation(getWeatherRecommendation(data.humidity, data.uvIndex))
      } catch (error) {
        console.error('Error fetching weather:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className={`bg-charcoal rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-charcoal-light rounded" />
          <div className="h-8 w-16 bg-charcoal-light rounded" />
        </div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase()
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return <Droplets className="w-8 h-8 text-california-gold" />
    }
    if (condition.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-california-gold" />
    }
    if (condition.includes('wind')) {
      return <Wind className="w-8 h-8 text-california-gold" />
    }
    return <Sun className="w-8 h-8 text-california-gold" />
  }

  return (
    <div className={`bg-charcoal rounded-lg p-4 border border-charcoal-light ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-warm-white/60 text-sm">Current Conditions</p>
          <p className="text-3xl font-bebas text-warm-white">{Math.round(weather.temp)}°F</p>
        </div>
        {getWeatherIcon()}
      </div>

      <div className="flex gap-4 text-sm text-warm-white/70 mb-3">
        <div className="flex items-center gap-1">
          <Droplets className="w-4 h-4" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Sun className="w-4 h-4" />
          <span>UV {weather.uvIndex}</span>
        </div>
      </div>

      {recommendation && (
        <div className="bg-california-gold/10 border border-california-gold/30 rounded p-3 mt-3">
          <p className="text-california-gold text-sm font-medium">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  )
}
