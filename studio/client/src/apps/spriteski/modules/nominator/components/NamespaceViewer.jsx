import { useState } from "react";
import { BsChevronRight } from "react-icons/bs";

export const NamespaceViewer = ({ data, selected, onNamespaceSelect }) => {
	const [expandedNodes, setExpandedNodes] = useState([]);

	const isLeaf = (namespace) => {
		return !data.some((item) => item.ParentNamespace === namespace);
	};

	const isAncestorOrSelf = (namespace, targetNamespace) => {
		return targetNamespace.startsWith(namespace + "-") || targetNamespace === namespace;
	};

	const toggleExpand = (namespace) => {
		if (!isLeaf(namespace)) {
			setExpandedNodes((prev) => {
				const ancestors = prev.filter((item) => isAncestorOrSelf(item, namespace));
				return ancestors.includes(namespace)
					? ancestors.filter((item) => item !== namespace)
					: [...ancestors, namespace];
			});
		}
	};

	const renderNamespace = (namespace) => {
		const parts = namespace.split("-");
		const lastPart = parts.pop();
		const isBold = namespace === selected;

		if (parts.length === 0) {
			return <span className={isBold ? "text-sky-500 font-bold" : ""}>{lastPart}</span>;
		}

		return (
			<>
				{parts.join("-")}-<span className={isBold ? "text-sky-500 font-bold" : ""}>{lastPart}</span>
			</>
		);
	};

	const buildTree = (parent, level) => (
		<ul className={level > 1 ? "pl-2" : ""}>
			{data
				.filter((item) => item.ParentNamespace === parent)
				.map((item) => (
					<li key={item.Namespace} className="">
						<button
							className={`flex items-center w-full p-2 text-left rounded text-neutral-700 hover:bg-neutral-50 hover:text-sky-500 focus:outline-none justify-left ${item.Namespace === selected ? "text-sky-500 font-bold" : ""}`}
							onClick={() => {
								toggleExpand(item.Namespace);
								onNamespaceSelect(item.Namespace);
							}}
						>
							{isLeaf(item.Namespace) && <div className="ml-2">&nbsp;</div>}
							{!isLeaf(item.Namespace) && (
								<BsChevronRight
									size={10}
									className={`mr-1 transition-transform duration-200 ${expandedNodes.includes(item.Namespace) ? "transform rotate-90" : ""}`}
								/>
							)}
							<div className="">{renderNamespace(item.Namespace)}</div>
							{!isLeaf(item.Namespace) && (
								<div className="ml-1 text-[8pt] text-neutral-400">
									({item.CountAtLevel})
								</div>
							)}
						</button>
						<div>
							{expandedNodes.includes(item.Namespace) && buildTree(item.Namespace, level + 1)}
						</div>
					</li>
				))}
		</ul>
	);

	return (
		<div className="p-2 font-mono text-xs font-light border border-b-2 border-r-2 border-solid rounded shadow-md bg-neutral-100 border-neutral-300">
			{buildTree(null, 1)}
		</div>
	);
};

export default NamespaceViewer;
