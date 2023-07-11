import { Menu } from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";

export const DropdownItem = ({ item, onSelect }) => {
	if(item.submenu && item.submenu.length) {
		return (
			<Menu as="div" className="relative group min-w-[180px] select-none">
				{ ({ open }) => (
					<>
						<Menu.Button className="inline-flex items-center justify-between w-full px-2 py-2 text-sm text-gray-900 bg-gray-200 hover:bg-gray-300">
							<div className="flex items-center">
								<BsThreeDots className={ `transition-transform duration-200 ease-in-out transform ${ open ? "rotate-90" : "" }` } />
								{ item.icon && <item.icon className="mx-2 text-gray-500" /> }
								{ item.name && <span className="ml-2">{ item.name }</span> }
								{ item.shortcut && <span className="ml-4 text-xs text-gray-400">{ item.shortcut }</span> }
							</div>
						</Menu.Button>
						<Menu.Items
							className={ `absolute left-0 w-full mt-1 origin-top-right bg-white divide-y divide-gray-100 rounded-none shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-in-out duration-150 transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 ${ open ? "visible" : "invisible" }` }
						>
							{ item.submenu.map((subItem, idx) => (
								<DropdownItem key={ idx } item={ subItem } onSelect={ onSelect } />
							)) }
						</Menu.Items>
					</>
				) }
			</Menu>
		);
	}

	return (
		<Menu.Item>
			{ ({ active }) => (
				<button
					className={ `${ active ? "bg-gray-200 text-gray-900" : "text-gray-900" } flex justify-between items-center w-full px-2 py-2 text-sm` }
					onClick={ () => onSelect(item.command) }
				>
					<div className="flex items-center">
						{ item.icon && <item.icon className="mr-2 text-gray-500" /> }
						{ item.name }
					</div>
					{ item.shortcut && <span className="text-xs text-gray-400">{ item.shortcut }</span> }
				</button>
			) }
		</Menu.Item>
	);
};

export const FileMenu = ({ data, onSelect }) => {
	return (
		<div className="flex space-x-2 bg-gray-100">
			{ data.map((item, idx) => (
				<DropdownItem key={ idx } item={ item } onSelect={ onSelect } />
			)) }
		</div>
	);
};

export default FileMenu;