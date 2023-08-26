import { useState } from "react";
import { BsChevronRight, BsChevronExpand, BsChevronContract, BsDatabase } from "react-icons/bs";

export const NamespaceViewer = ({ data, selected, onSelect, onHover }) => {
	const [ expandedNodes, setExpandedNodes ] = useState([]);

	const isLeaf = (namespace) => {
		return !data.some((item) => item.ParentNamespace === namespace);
	};

	const isAncestorOrSelf = (namespace, targetNamespace) => {
		return targetNamespace.startsWith(namespace + "-") || targetNamespace === namespace;
	};

	const toggleExpand = (namespace, e) => {
		e.stopPropagation();
		if(!isLeaf(namespace)) {
			setExpandedNodes((prev) => {
				const ancestors = prev.filter((item) => isAncestorOrSelf(item, namespace));
				return ancestors.includes(namespace)
					? ancestors.filter((item) => item !== namespace)
					: [ ...ancestors, namespace ];
			});
		}
	};

	const expandAll = () => {
		setExpandedNodes(data.map(item => item.Namespace));
	};

	const collapseAll = () => {
		setExpandedNodes([]);
	};

	const renderNamespace = (namespace) => {
		const parts = namespace.split("-");
		const lastPart = parts.pop();
		const isBold = namespace === selected;

		if(parts.length === 0) {
			return <span className={ isBold ? "text-sky-500 font-bold" : "" }>{ lastPart }</span>;
		}

		return (
			<>
				{ parts.join("-") }-<span className={ "text-sky-500 " + (isBold ? "font-bold" : "") }>{ lastPart }</span>
			</>
		);
	};

	const buildTree = (parent, level) => (
		<ul className={ level > 1 ? "pl-2" : "" }>
			{ data
				.filter((item) => item.ParentNamespace === parent)
				.map((item) => (
					<li key={ item.Namespace } className="">
						<button
							className={ `flex items-center w-full p-2 text-left rounded text-neutral-700 hover:bg-neutral-50 hover:text-sky-500 focus:outline-none justify-left ${ item.Namespace === selected ? "text-sky-500 font-bold" : "" }` }
							onClick={ e => {
								onSelect?.(item.Namespace);
							} }
							onDoubleClick={ e => {
								toggleExpand(item.Namespace, e);
							} }
							onMouseOver={ () => {
								onHover?.(item.Namespace);
							} }
						>
							{ isLeaf(item.Namespace) && <div className="ml-2">&nbsp;</div> }
							{ !isLeaf(item.Namespace) && (
								<div className="p-2 mr-1 rounded-full hover:bg-neutral-50 hover:text-sky-500">
									<BsChevronRight
										size={ 12 }
										className={ `transition-transform duration-200 ${ expandedNodes.includes(item.Namespace) ? "transform rotate-90" : "" }` }
										onClick={ e => toggleExpand(item.Namespace, e) }
									/>
								</div>
							) }
							<div className="">{ renderNamespace(item.Namespace) }</div>
							{ !isLeaf(item.Namespace) && (
								<div className="ml-1 text-[8pt] text-neutral-400">
									({ item.CountAtLevel })
								</div>
							) }
						</button>
						<div>
							{ expandedNodes.includes(item.Namespace) && buildTree(item.Namespace, level + 1) }
						</div>
					</li>
				)) }
		</ul>
	);

	return (
		<>
			<div className="flex items-center mb-2">
				<BsDatabase size={ 16 } className="mr-2 text-neutral-400" />
				<div
					className="flex-grow p-2 font-mono font-bold border rounded"
				>
					Database Textures
				</div>
				{
					expandedNodes?.length > 0 ? (
						<button
							onClick={ collapseAll }
							className="flex items-center justify-center w-8 h-8 p-1 ml-2 rounded text-neutral-700 hover:bg-neutral-50 hover:text-sky-500 focus:outline-none"
						>
							<BsChevronContract size={ 16 } />
						</button>
					) : (
						<button
							onClick={ expandAll }
							className="flex items-center justify-center w-8 h-8 p-1 ml-2 rounded text-neutral-700 hover:bg-neutral-50 hover:text-sky-500 focus:outline-none"
						>
							<BsChevronExpand size={ 16 } />
						</button>
					)
				}
			</div>
			{ buildTree(null, 1) }
		</>
	);
};

export default NamespaceViewer;