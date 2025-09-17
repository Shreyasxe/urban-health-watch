import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, Heart, Leaf, Shield, Lightbulb } from 'lucide-react';

interface EducationalTip {
  id: string;
  category: 'air-quality' | 'weather' | 'health' | 'environment' | 'safety';
  title: string;
  content: string;
  actionable: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const tips: EducationalTip[] = [
  {
    id: '1',
    category: 'air-quality',
    title: 'Understanding Air Quality Index (AQI)',
    content: 'AQI is a standardized way to measure air pollution. Values below 50 are considered good, while values above 150 can affect sensitive individuals. The higher the AQI, the more harmful the air quality.',
    actionable: [
      'Check AQI before outdoor activities',
      'Limit exercise outdoors when AQI > 100',
      'Use air purifiers indoors during high pollution days',
      'Wear N95 masks in heavily polluted areas'
    ],
    icon: Leaf,
    color: 'text-health-good'
  },
  {
    id: '2',
    category: 'health',
    title: 'Protecting Yourself from Air Pollution',
    content: 'Long-term exposure to air pollution can lead to respiratory and cardiovascular diseases. Children, elderly, and people with pre-existing conditions are most vulnerable.',
    actionable: [
      'Exercise indoors when air quality is poor',
      'Keep windows closed during high pollution',
      'Plant air-purifying plants in your home',
      'Avoid busy roads during peak hours'
    ],
    icon: Heart,
    color: 'text-red-500'
  },
  {
    id: '3',
    category: 'weather',
    title: 'Heat Index and Health Risks',
    content: 'The heat index combines temperature and humidity to show how hot it feels. High heat index values can lead to heat exhaustion and heat stroke, especially during physical activity.',
    actionable: [
      'Stay hydrated throughout the day',
      'Wear light-colored, loose clothing',
      'Avoid outdoor activities during peak heat (10 AM - 4 PM)',
      'Seek air-conditioned spaces when possible'
    ],
    icon: Shield,
    color: 'text-orange-500'
  },
  {
    id: '4',
    category: 'environment',
    title: 'Green Spaces and Mental Health',
    content: 'Access to parks and green areas reduces stress, improves mood, and provides cleaner air. Even small amounts of nature exposure can have significant health benefits.',
    actionable: [
      'Spend at least 20 minutes in nature daily',
      'Visit local parks and green spaces',
      'Create a small garden or indoor plants',
      'Take walking meetings in parks when possible'
    ],
    icon: Leaf,
    color: 'text-green-500'
  },
  {
    id: '5',
    category: 'safety',
    title: 'UV Radiation and Skin Protection',
    content: 'UV radiation peaks between 10 AM and 4 PM. Even on cloudy days, up to 80% of UV rays can penetrate clouds. Prolonged exposure increases skin cancer risk.',
    actionable: [
      'Apply SPF 30+ sunscreen 30 minutes before going outside',
      'Reapply sunscreen every 2 hours',
      'Wear wide-brimmed hats and UV-protective clothing',
      'Seek shade during peak UV hours'
    ],
    icon: Shield,
    color: 'text-yellow-500'
  },
  {
    id: '6',
    category: 'health',
    title: 'Indoor Air Quality Improvement',
    content: 'Indoor air can be 2-5 times more polluted than outdoor air. Common sources include cooking, cleaning products, furniture, and poor ventilation.',
    actionable: [
      'Ventilate rooms regularly, especially when cooking',
      'Use natural cleaning products when possible',
      'Maintain HVAC systems and change filters regularly',
      'Add air-purifying plants like snake plants or peace lilies'
    ],
    icon: Heart,
    color: 'text-blue-500'
  },
  {
    id: '7',
    category: 'environment',
    title: 'Reducing Your Environmental Impact',
    content: 'Individual actions can collectively improve urban air quality. Transportation, energy use, and consumption patterns all affect environmental health.',
    actionable: [
      'Use public transportation, bike, or walk when possible',
      'Reduce energy consumption at home',
      'Choose locally-sourced products',
      'Participate in community environmental initiatives'
    ],
    icon: Lightbulb,
    color: 'text-green-600'
  },
];

export const EducationalTips: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate tips every 10 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentTip = tips[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    setIsAutoPlaying(false);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
    setIsAutoPlaying(false);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'air-quality': return 'bg-blue-100 text-blue-800';
      case 'weather': return 'bg-orange-100 text-orange-800';
      case 'health': return 'bg-red-100 text-red-800';
      case 'environment': return 'bg-green-100 text-green-800';
      case 'safety': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCategory = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="p-6 shadow-data-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Health & Environment Tips</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {currentTipIndex + 1} of {tips.length}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tip Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={prevTip}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex space-x-1">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentTipIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTipIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={nextTip}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Tip */}
        <div className="animate-fade-in">
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <currentTip.icon className={`h-6 w-6 ${currentTip.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg">{currentTip.title}</h3>
                <Badge className={getCategoryBadgeColor(currentTip.category)}>
                  {formatCategory(currentTip.category)}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {currentTip.content}
              </p>
            </div>
          </div>

          {/* Actionable Items */}
          <div className="bg-accent/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-primary" />
              Action Steps
            </h4>
            <div className="space-y-2">
              {currentTip.actionable.map((action, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isAutoPlaying && (
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-100 ease-linear"
              style={{ 
                width: '100%', 
                animation: 'progress 10s linear infinite' 
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </Card>
  );
};