// Mock Data for Prompts
// This data can be easily moved to a database later
// Just replace the imports with API calls

import { Prompt } from '@/types/prompt';

// Image imports for preview images
import socialMediaAds from '@/assets/prompts/social-media-ads.jpg';
import headphonesProduct from '@/assets/prompts/headphones-product.jpg';
import sneakerProduct from '@/assets/prompts/sneaker-product.jpg';
import perfumeProduct from '@/assets/prompts/perfume-product.jpg';
import marsPoster from '@/assets/prompts/mars-poster.jpg';
import smartphoneProduct from '@/assets/prompts/smartphone-product.jpg';
import waterBottle from '@/assets/prompts/water-bottle.jpg';
import dashboardUi from '@/assets/prompts/dashboard-ui.jpg';
import fantasyDragon from '@/assets/prompts/fantasy-dragon.jpg';

export const mockPrompts: Prompt[] = [
  {
    id: 'prompt-001',
    title: 'A hooded man with Google and Facebook logos',
    description: 'Ultra-realistic lifestyle advertisement featuring a mysterious figure with floating social media logos and money',
    promptText: 'A hooded man with Google and Facebook logos, neon outlines, stacks of money, dark background, red arrows pointing between the logos, ultra-realistic, cinematic lighting, 8k resolution, dramatic atmosphere, digital marketing concept',
    promptType: 'Image',
    category: 'Ads',
    tool: 'Midjourney',
    tags: ['social media', 'marketing', 'neon', 'cinematic', 'lifestyle'],
    previewImage: socialMediaAds,
    isPublished: true,
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 'prompt-002',
    title: 'Cinematic product advertisement of matte black headphones',
    description: 'Matte black Beats by Dre wireless headphones displayed in ultra-high detail studio lighting',
    promptText: 'Cinematic product advertisement of matte black Beats by Dre wireless headphones displayed in ultra-high detail, suspended slightly above a reflective surface, studio lighting, dramatic shadows, product photography, 8k resolution, professional commercial shot',
    promptType: 'Image',
    category: 'Products',
    tool: 'DALL·E',
    tags: ['product', 'headphones', 'studio', 'commercial', 'premium'],
    previewImage: headphonesProduct,
    isPublished: true,
    createdAt: new Date('2024-12-14'),
  },
  {
    id: 'prompt-003',
    title: 'Hyperrealistic neon green sneaker advertisement',
    description: 'Bold neon green Adidas sneaker suspended mid-air in a minimalist futuristic showroom',
    promptText: 'Hyperrealistic product advertisement featuring a bold neon green Adidas sneaker suspended mid-air in a minimalist, futuristic showroom. The sneaker floats against a dark gradient background with subtle reflections, dramatic rim lighting highlighting the shoe\'s texture and details, 8k resolution, commercial photography',
    promptType: 'Image',
    category: 'Products',
    tool: 'Midjourney',
    tags: ['sneaker', 'neon', 'futuristic', 'product', 'adidas'],
    previewImage: sneakerProduct,
    isPublished: true,
    createdAt: new Date('2024-12-13'),
  },
  {
    id: 'prompt-004',
    title: 'Luxurious violet glass perfume bottle',
    description: 'Elegant perfume bottle on silk fabric with dramatic spotlight beam',
    promptText: 'A luxurious violet glass perfume bottle named "Nocturne Iris" rests on silk fabric, spotlighted with a single hard beam from above creating a dramatic atmosphere. Dark moody background, product photography, high-end luxury aesthetic, 8k resolution, commercial shot',
    promptType: 'Image',
    category: 'Products',
    tool: 'Stable Diffusion',
    tags: ['perfume', 'luxury', 'elegant', 'violet', 'product'],
    previewImage: perfumeProduct,
    isPublished: true,
    createdAt: new Date('2024-12-12'),
  },
  {
    id: 'prompt-005',
    title: 'Retro-futuristic travel poster for Mars',
    description: 'Visit Mars travel poster in retro space age aesthetic',
    promptText: 'A retro-futuristic travel poster for Mars, rendered in ultra-HD digital art style. Bold typography "VISIT MARS" at the top, vintage space age aesthetic, vibrant red and orange Martian landscape, retro rockets and domes, 1950s sci-fi illustration style, travel poster art',
    promptType: 'Image',
    category: 'Ads',
    tool: 'Midjourney',
    tags: ['retro', 'mars', 'poster', 'space', 'vintage'],
    previewImage: marsPoster,
    isPublished: true,
    createdAt: new Date('2024-12-11'),
  },
  {
    id: 'prompt-006',
    title: 'Next-gen smartphone hovering mid-air',
    description: 'Futuristic smartphone with holographic display on concrete background',
    promptText: 'A next-gen smartphone hovering mid-air in a massive concrete void space, displaying a 3D UI hologram with widgets and notifications, translucent glass body, dramatic lighting, futuristic tech concept, product photography, 8k resolution',
    promptType: 'Image',
    category: 'Products',
    tool: 'DALL·E',
    tags: ['smartphone', 'futuristic', 'hologram', 'tech', 'product'],
    previewImage: smartphoneProduct,
    isPublished: true,
    createdAt: new Date('2024-12-10'),
  },
  {
    id: 'prompt-007',
    title: 'Frosted glass bottle of artisanal sparkling water',
    description: 'Luxury beverage photography with glowing aqua ice',
    promptText: 'A frosted glass bottle of artisanal sparkling water titled "LUMINA" stands upright on cracked ice with glowing aqua veins beneath. A luminous turquoise liquid shimmers inside, luxury beverage photography, dark background, professional commercial shot, 8k resolution',
    promptType: 'Image',
    category: 'Products',
    tool: 'Stable Diffusion',
    tags: ['beverage', 'water', 'luxury', 'ice', 'commercial'],
    previewImage: waterBottle,
    isPublished: true,
    createdAt: new Date('2024-12-09'),
  },
  {
    id: 'prompt-008',
    title: 'Modern minimalist dashboard UI design',
    description: 'Dark theme dashboard with neon blue accents and data visualization',
    promptText: 'Modern minimalist dashboard UI design, dark theme with neon blue accents, floating cards and data visualization, glassmorphism effect, tech interface mockup, clean typography, gradient backgrounds, professional UI/UX design, 4k resolution',
    promptType: 'Image',
    category: 'UI',
    tool: 'Midjourney',
    tags: ['dashboard', 'ui', 'dark theme', 'data viz', 'glassmorphism'],
    previewImage: dashboardUi,
    isPublished: true,
    createdAt: new Date('2024-12-08'),
  },
  {
    id: 'prompt-009',
    title: 'Epic fantasy dragon in stormy skies',
    description: 'Majestic dragon soaring through lightning-filled clouds',
    promptText: 'Epic fantasy dragon soaring through stormy clouds with lightning, cinematic dark fantasy art, detailed scales and wings, dramatic lighting, massive wingspan, thunderstorm background, mythical creature, 8k resolution, digital painting',
    promptType: 'Image',
    category: 'Fantasy',
    tool: 'Midjourney',
    tags: ['dragon', 'fantasy', 'epic', 'storm', 'mythical'],
    previewImage: fantasyDragon,
    isPublished: true,
    createdAt: new Date('2024-12-07'),
  },
];

// Helper functions to simulate database operations
// These can be replaced with actual API calls later

export const getAllPrompts = (): Prompt[] => {
  return mockPrompts.filter(p => p.isPublished);
};

export const getPromptById = (id: string): Prompt | undefined => {
  return mockPrompts.find(p => p.id === id);
};

export const getPromptsByCategory = (category: string): Prompt[] => {
  return mockPrompts.filter(p => p.category === category && p.isPublished);
};

export const getPromptsByTool = (tool: string): Prompt[] => {
  return mockPrompts.filter(p => p.tool === tool && p.isPublished);
};

export const getPromptsByType = (type: string): Prompt[] => {
  return mockPrompts.filter(p => p.promptType === type && p.isPublished);
};

export const searchPrompts = (query: string): Prompt[] => {
  const lowerQuery = query.toLowerCase();
  return mockPrompts.filter(p => 
    p.isPublished && (
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  );
};

// Categories and tools for filters
export const categories: string[] = [
  'All',
  'Products',
  'Ads',
  'Fantasy',
  'Architecture',
  'UI',
  'Cyberpunk',
  'Nature',
  'Portrait',
  'Abstract',
];

export const tools: string[] = [
  'All',
  'ChatGPT',
  'Midjourney',
  'DALL·E',
  'Stable Diffusion',
];

export const promptTypes: string[] = [
  'All',
  'Image',
  'Text',
  'Video',
  'Code',
];
