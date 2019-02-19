export function NewUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

export function Clamp(value, min, max) {
	if(value > max) {
		value = max;
	}
	if(value < min) {
		value = min;
	}

	return value;
}
export function MinClamp(value, min) {
	if(value < min) {
		value = min;
	}

	return value;
}
export function MaxClamp(value, max) {
	if(value > max) {
		value = max;
	}

	return value;
}

export default {
	NewUUID,
	
	Clamp,
	MinClamp,
	MaxClamp
};