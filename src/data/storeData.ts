import type { Product, CarouselSlide, NavLink } from '../types/store';

export const navLinks: NavLink[] = [
  { label: 'Shop', href: '#store' },
  { label: 'About', href: '#about' },
];

export const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: 'Stripy Zig Zag Jigsaw Pillow and Duvet Set',
    image: 'https://images.unsplash.com/photo-1422190441165-ec2956dc9ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    link: '#',
    linkText: 'view product',
  },
  {
    id: 2,
    title: 'Real Bamboo Wall Clock',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    link: '#',
    linkText: 'view product',
  },
  {
    id: 3,
    title: 'Brown and blue hardbound book',
    image: 'https://images.unsplash.com/photo-1519327232521-1ea2c736d34d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    link: '#',
    linkText: 'view product',
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Stripy Zig Zag Jigsaw Pillow',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1555982105-d25af4182e4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 2,
    name: 'Minimalist Wall Clock',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1508423134147-addf71308178?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 3,
    name: 'Modern Desk Lamp',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 4,
    name: 'Classic Vintage Typewriter',
    price: '£9.99',
    image: 'https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 5,
    name: 'Abstract Framed Art',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1467949576168-6ce8e2df4e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 6,
    name: 'Ceramic Coffee Mug',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 7,
    name: 'Office Notebook Set',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1550837368-6594235de85c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
  {
    id: 8,
    name: 'Nordic Plant Pot',
    price: '£9.99',
    image: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80',
  },
];
