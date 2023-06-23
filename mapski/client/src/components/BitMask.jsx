import { useState } from 'react';

export const BitMask = ({ mask, dict }) => {
	// Next an array of bits from the mask
	const bits = Array.from({ length: 8 }, (_, i) => (mask & (1 << i)) !== 0);

	// State for tooltip
	const [ tooltip, setTooltip ] = useState({ show: false, text: '', x: 0, y: 0 });

	// Reverse lookup function to get the flags for each bit
	const getFlags = (bitIndex) => {
		if(!dict) {
			return '';
		}

		return Object.entries(dict)
			.filter(([ key, value ]) => (value & (1 << bitIndex)) !== 0)
			.map(([ key ]) => key)
			.join(', ');
	};

	const handleMouseOver = (e, i) => {
		const rect = e.target.getBoundingClientRect();
		setTooltip({
			show: true,
			text: getFlags(i),
			x: i * rect.width,
			y: rect.height * 1.25,
		});
	};

	const handleMouseOut = () => {
		setTooltip({ show: false, text: '', x: 0, y: 0 });
	};

	return (
		<div className="relative flex space-x-px">
			{ bits.map((bit, i) => (
				<div
					key={ i }
					className={ `w-8 h-4 rounded cursor-pointer ${ bit ? 'bg-blue-400' : 'bg-gray-200' }` }
					onMouseOver={ (e) => handleMouseOver(e, i) }
					onMouseOut={ handleMouseOut }
				/>
			)) }
			{ tooltip.show && tooltip.text && (
				<div
					className="absolute p-2 text-xs font-bold border border-solid rounded shadow-lg text-neutral-500 bg-neutral-50 border-neutral-200"
					style={ { left: `${ tooltip.x }px`, top: `${ tooltip.y }px`, transform: 'translateX(-50%)' } }
				>
					{ tooltip.text }
				</div>


			) }
		</div>
	);
};

export default BitMask;
