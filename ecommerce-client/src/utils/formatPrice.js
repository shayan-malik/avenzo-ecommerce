// currency badalni ho to sirf yahan badlein (jaise "Rs ")
export const formatPrice = (value) => `Rs${Number(value).toFixed(2)}`;