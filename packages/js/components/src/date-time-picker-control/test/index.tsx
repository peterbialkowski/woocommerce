/**
 * External dependencies
 */
import { render, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from '@wordpress/element';
import { isRTL } from '@wordpress/i18n/build-types';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { DateTimePickerControl } from '../';

describe( 'DateTimePickerControl', () => {
	// The end user of the component doesn't care about how it is rendered in the DOM.
	// The consumer of the component might, however, if they are applying any custom styles to it.
	// By having this test, we will know right away if the resulting DOM changes at some point, so that we
	// can address that in documentation.
	it( 'should render the expected DOM elements', () => {
		const { container } = render(
			<DateTimePickerControl
				label="This is the label"
				help="This is the help"
				placeholder="This is the placeholder"
			/>
		);

		// Make sure the default classname is set on the component.
		const control = container.querySelector(
			'.woocommerce-date-time-picker-control'
		);
		expect( control ).toBeInTheDocument();

		// Make sure the default classname is set on the label.
		const label = control?.querySelector(
			'.components-base-control__label'
		);
		expect( label ).toBeInTheDocument();

		// Make sure the default classname is set on the help.
		const help = control?.querySelector( '.components-base-control__help' );
		expect( help ).toBeInTheDocument();
	} );

	it( 'should add a class name if set', () => {
		const { container } = render(
			<DateTimePickerControl className="custom-class-name" />
		);

		const control = container.querySelector( '.custom-class-name' );
		expect( control ).toBeInTheDocument();
	} );

	it( 'should render a label if set', () => {
		const { getByText } = render(
			<DateTimePickerControl label="This is the label" />
		);

		expect( getByText( 'This is the label' ) ).toBeInTheDocument();
	} );

	it( 'should render a help message if set', () => {
		const { getByText } = render(
			<DateTimePickerControl help="This is the help" />
		);

		expect( getByText( 'This is the help' ) ).toBeInTheDocument();
	} );

	it( 'should render a placeholder if set', () => {
		const { container } = render(
			<DateTimePickerControl placeholder="This is the placeholder" />
		);

		const input = container.querySelector( 'input' );
		expect( input?.placeholder === 'This is the placeholder' );
	} );

	it( 'should disable the input if set', () => {
		const { container } = render(
			<DateTimePickerControl disabled={ true } />
		);

		const input = container.querySelector( 'input' );
		expect( input ).toBeDisabled();
	} );

	it( 'should use the default 24 hour date time format', () => {
		const dateTime = moment( '2022-09-15 02:30:40' );

		const { container } = render(
			<DateTimePickerControl currentDate={ dateTime.toISOString() } />
		);

		const input = container.querySelector( 'input' );
		expect( input?.value === '09/15/2022 02:30' );
	} );

	it( 'should use the default 12 hour date time format', () => {
		const dateTime = moment( '2022-09-15 02:30:40' );

		const { container } = render(
			<DateTimePickerControl
				currentDate={ dateTime.toISOString() }
				is12Hour={ true }
			/>
		);

		const input = container.querySelector( 'input' );
		expect( input?.value === '09/15/2022 02:30 AM' );
	} );

	it( 'should use the date time format if set', () => {
		const dateTime = moment( '2022-09-15 02:30:40' );

		const { container } = render(
			<DateTimePickerControl
				currentDate={ dateTime.toISOString() }
				dateTimeFormat="H:mm, MM-DD-YYYY"
			/>
		);

		const input = container.querySelector( 'input' );
		expect( input?.value === '02:30, 09-15-2022' );
	} );

	it( 'should show the date time picker popup when focused', async () => {
		const { container, queryByText } = render( <DateTimePickerControl /> );

		const input = container.querySelector( 'input' );

		userEvent.click( input! );

		await waitFor( () =>
			expect(
				container.querySelector( '.components-dropdown__content' )
			).toBeInTheDocument()
		);
	} );

	it( 'should hide the date time picker popup when no longer focused', async () => {
		const { container } = render( <DateTimePickerControl /> );

		const input = container.querySelector( 'input' );
		userEvent.click( input! );
		fireEvent.blur( input! );

		await waitFor( () =>
			expect(
				container.querySelector( '.components-dropdown__content' )
			).not.toBeInTheDocument()
		);
	} );

	it( 'should set the date time picker popup to 12 hour mode', async () => {
		const { container, queryByText } = render(
			<DateTimePickerControl is12Hour={ true } />
		);

		const input = container.querySelector( 'input' );

		userEvent.click( input! );

		await waitFor( () =>
			expect(
				container.querySelector(
					'.components-datetime__time-pm-button'
				)
			).toBeInTheDocument()
		);
	} );

	it( 'should call onBlur when losing focus', async () => {
		const onBlurHandler = jest.fn();

		const { container } = render(
			<DateTimePickerControl onBlur={ onBlurHandler } />
		);

		const input = container.querySelector( 'input' );
		userEvent.click( input! );
		fireEvent.blur( input! );

		await waitFor( () =>
			expect( onBlurHandler ).toHaveBeenCalledTimes( 1 )
		);
	} );

	// We need to bump up the timeout for this test because:
	//     1. userEvent.type() is slow (see https://github.com/testing-library/user-event/issues/577)
	//     2. moment.js is slow
	// Otherwise, the following error can occur on slow machines (such as our CI), because Jest times out and starts
	// tearing down the component while test microtasks are still being executed
	// (see https://github.com/facebook/jest/issues/12670)
	//       TypeError: Cannot read properties of null (reading 'createEvent')
	it( 'should call onChange when the input is changed', async () => {
		const originalDateTime = moment( '2022-09-15 02:30:40' );
		const dateTimeFormat = 'HH:mm, MM-DD-YYYY';
		const newDateTimeInputString = '02:04, 06-08-2010';
		const newDateTime = moment( newDateTimeInputString, dateTimeFormat );
		const onChangeHandler = jest.fn();

		const { container } = render(
			<DateTimePickerControl
				dateTimeFormat={ dateTimeFormat }
				currentDate={ originalDateTime.toISOString() }
				onChange={ onChangeHandler }
				onChangeDebounceWait={ 10 }
			/>
		);

		const input = container.querySelector( 'input' );
		userEvent.type(
			input!,
			'{selectall}{backspace}' + newDateTimeInputString
		);

		await waitFor(
			() =>
				expect( onChangeHandler ).toHaveBeenLastCalledWith(
					newDateTime.toISOString(),
					true
				),
			{ timeout: 100 }
		);
	}, 10000 );

	// We need to bump up the timeout for this test because:
	//     1. userEvent.type() is slow (see https://github.com/testing-library/user-event/issues/577)
	//     2. moment.js is slow
	// Otherwise, the following error can occur on slow machines (such as our CI), because Jest times out and starts
	// tearing down the component while test microtasks are still being executed
	// (see https://github.com/facebook/jest/issues/12670)
	//       TypeError: Cannot read properties of null (reading 'createEvent')
	it( 'should call onChange with isValid false when the input is invalid', async () => {
		const originalDateTime = moment( '2022-09-15 02:30:40' );
		const onChangeHandler = jest.fn();
		const invalidDateTime = 'I am not a valid date time';

		const { container } = render(
			<DateTimePickerControl
				currentDate={ originalDateTime.toISOString() }
				onChange={ onChangeHandler }
				onChangeDebounceWait={ 10 }
			/>
		);

		const input = container.querySelector(
			'.woocommerce-date-time-picker-control input'
		);
		userEvent.type( input!, '{selectall}{backspace}' + invalidDateTime );

		await waitFor( () =>
			expect( onChangeHandler ).toHaveBeenLastCalledWith(
				invalidDateTime,
				false
			)
		);
	}, 10000 );

	// Skipping this test for now because it does not work with Jest's fake timers
	it.skip( 'should call onChange once when multiple changes are made rapidly', async () => {
		const originalDateTime = moment( '2022-09-15 02:30:40' );
		const onChangeHandler = jest.fn();

		const { container } = render(
			<DateTimePickerControl
				currentDate={ originalDateTime.toISOString() }
				onChange={ onChangeHandler }
				onChangeDebounceWait={ 100 }
			/>
		);

		const input = container.querySelector(
			'.woocommerce-date-time-picker-control input'
		);

		// This is a workaround to get the test working;
		// @testing-library/user-event@13.5 userEvent.type does not work with Jest's fake timers
		// see: https://github.com/testing-library/user-event/issues/565
		// upgrading to @testing-library/user-event@14 is necessary
		jest.useRealTimers();

		await userEvent.type( input!, '{selectall}{backspace}abc', {
			delay: 10,
		} );

		await waitFor( () =>
			expect( onChangeHandler ).toHaveBeenCalledTimes( 1 )
		);
	} );

	// Skipping this test for now because it does not work with Jest's fake timers
	it.skip( 'should call onChange multiple times when multiple changes are made slowly', async () => {
		const originalDateTime = moment( '2022-09-15 02:30:40' );
		const onChangeHandler = jest.fn();
		const inputToType = 'abc';

		const { container } = render(
			<DateTimePickerControl
				currentDate={ originalDateTime.toISOString() }
				onChange={ onChangeHandler }
				onChangeDebounceWait={ 10 }
			/>
		);

		const input = container.querySelector(
			'.woocommerce-date-time-picker-control input'
		);

		// This is a workaround to get the test working;
		// @testing-library/user-event@13.5 userEvent.type does not work with Jest's fake timers
		// see: https://github.com/testing-library/user-event/issues/565
		// upgrading to @testing-library/user-event@14 is necessary
		jest.useRealTimers();

		await userEvent.type( input!, '{selectall}{backspace}' + inputToType, {
			delay: 100,
		} );

		await waitFor( () =>
			expect( onChangeHandler ).toHaveBeenCalledTimes(
				inputToType.length - 1
			)
		);
	} );

	it( 'should not call onChange if no changes are made', async () => {
		const originalDateTime = moment( '2022-09-15 02:30:40' );
		const onChangeHandler = jest.fn();

		const { container } = render(
			<DateTimePickerControl
				currentDate={ originalDateTime.toISOString() }
				onChange={ onChangeHandler }
				onChangeDebounceWait={ 10 }
			/>
		);

		await waitFor( () => expect( onChangeHandler ).not.toHaveBeenCalled() );
	} );
} );
