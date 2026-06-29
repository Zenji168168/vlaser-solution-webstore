export type Product = {
  id: string
  sku: string
  name: string
  description: string
  price: number
  brand: string
  category: string
  status: string
  qty: number
  image: string
  notes: string
}

export const CATEGORIES = [
  'All',
  'CCTV',
  'Access Control',
  'Attendance',
  'Alarm System',
  'Network',
  'Accessories',
  'Audio / PA System',
  'Cabinet',
  'Smart Lock',
]

export const BRANDS = [
  'All',
  'Hikvision',
  'UNV',
  'ZKTeco',
  'EZVIZ',
  'HUAWEI',
  'Watashi',
  'ITC',
  'Toten',
  'ATECH',
  'Comscope',
  'Seagate',
  'ruijie',
  'NGTeco',
  'Vlaser',
]
