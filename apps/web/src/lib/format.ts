const inr = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

export const formatINR = (value: number) => inr.format(value);
export const formatNumber = (value: number) => value.toLocaleString('en-IN');
