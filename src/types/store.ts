export interface Product {
  id: string | number;
  name: string;
  price: string;
  image: string;
  link?: string;
}

export interface CarouselSlide {
  id: string | number;
  title: string;
  image: string;
  link: string;
  linkText: string;
}

export interface NavLink {
  label: string;
  href: string;
}
