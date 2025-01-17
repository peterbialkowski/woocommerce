/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createElement, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DraggableIcon } from './draggable-icon';
import { SortableContext } from './index';
import { SortableContextType } from './types';

type SortableHandleProps = {
	children?: React.ReactNode;
};

export const SortableHandle = ( { children }: SortableHandleProps ) => {
	const { onDragStart, onDragEnd }: SortableContextType =
		useContext( SortableContext );

	return (
		<div
			className="woocommerce-sortable__handle"
			draggable
			onDragStart={ onDragStart }
			onDragEnd={ onDragEnd }
		>
			{ children ? children : <DraggableIcon /> }
		</div>
	);
};
