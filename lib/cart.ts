export type CartItem = { productid:number; title:string; price:string; image_url:string|null; quantity:number };
export const getCart=():CartItem[]=>{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem('mcu-cart')||'[]')}catch{return []}};
export const saveCart=(items:CartItem[])=>localStorage.setItem('mcu-cart',JSON.stringify(items));
