const EXCLUDED_TAGS = {
	'file': true,
	'submit': true,
	'image': true,
	'reset': true,
	'button': true
};

type FormValue = { [ key: string ]: any };

/**
 * Returns the index of the first enabled option in the select element.
 * Used for resetting values in single-value select fields.
 */
function findFirstEnabledIndex(select: HTMLSelectElement) {
	const length = select.options.length;
	for (let i = 0; i < length; i++) {
		if (!select.options[i].disabled) {
			return i;
		}
	}
	return -1;
}

/**
 * Fills in a DOM form using values from a JavaScript object.
 * Note that fields not specified in the value object will be cleared.
 *
 * @param form The DOM form to set values in
 * @param object An object containing values for each field in the form
 *
 * @example
 * let formNode = document.getElementById('aForm');
 * form.fromObject(formNode, { firstName: 'foo', lastName: 'bar' });
 */
export function fromObject(form: HTMLFormElement, object: FormValue): void {
	const elements = form.elements;
	for (let i = 0; i < elements.length; i++) {
		const element = <HTMLInputElement> elements[i];
		const type = element.type;
		const name = element.name;

		if (!name || (type in EXCLUDED_TAGS) || element.disabled) {
			continue;
		}

		switch (type) {
			case 'checkbox':
				element.checked = false;
				if (name in object) {
					const checkValue = Array.isArray(object[name]) ? object[name] : [ object[name] ];
					element.checked = checkValue.indexOf(element.value) !== -1;
				}
				break;

			case 'radio':
				element.checked = (name in object) && object[name] === element.value;
				break;

			case 'select-multiple':
				const multiSelectElement: HTMLSelectElement = <any> element;
				if (name in object) {
					const selectValue = Array.isArray(object[name]) ? object[name] : [ object[name] ];
					for (let i = 0; i < multiSelectElement.options.length; i++) {
						const option = multiSelectElement.options[i];
						option.selected = selectValue.indexOf(option.value) !== -1;
					}
				}
				else {
					multiSelectElement.selectedIndex = -1;
				}
				break;

			case 'select-one':
				const selectElement: HTMLSelectElement = <any> element;
				if (name in object) {
					const selectValue = object[name];
					for (let i = 0; i < selectElement.options.length; i++) {
						const option = selectElement.options[i];
						option.selected = selectValue === option.value;
					}
				}
				else {
					selectElement.selectedIndex = findFirstEnabledIndex(selectElement);
				}
				break;

			case 'hidden':
			case 'text':
			case 'textarea':
			case 'password':
				// A text input value is the empty string by default
				element.value = object[name] || '';
				break;
		}
	}
}

/**
 * Gets the value of a form field.
 */
function getValue(element: HTMLInputElement): string | string[] {
	const type = element.type;
	let value: string | string[];

	if (type === 'radio' || type === 'checkbox') {
		if (element.checked) {
			value = element.value;
		}
	}
	else if (element.multiple) {
		// For fields with the 'multiple' attribute set, gather the values of all descendant <option> elements that are
		// selected. This code assumes the field is a select or datalist (something with options).
		const options = element.querySelectorAll('option:checked');
		const numOptions = options.length;
		if (numOptions) {
			const values = <string[]> [];
			for (let i = 0; i < numOptions; i++) {
				values.push((<HTMLOptionElement> options[i]).value);
			}
			value = values;
		}
	}
	else {
		value = element.value;
	}

	return value;
}

/**
 * Stores the value of a form field in a value object.
 */
function storeFieldValue(object: FormValue, element: HTMLInputElement) {
	const value = getValue(element);

	// Ignore null or undefined values
	if (value == null) {
		return;
	}

	const name = element.name;

	// Determine whether value needs to be an array based on whether the field
	// can potentially accommodate multiple values.
	// Note that only checkbox groups need special logic here since its elements are iterated separately;
	// getValue already returns an array for multi-select elements.
	if (element.type === 'checkbox' && element.form[element.name].length > 1) {
		if (name in object) {
			object[name].push(value);
		}
		else {
			object[name] = [ value ];
		}
	}
	else {
		object[name] = value;
	}
}

/**
 * Serializes the values of a DOM form into a JavaScript object.
 *
 * @param form The DOM form to get values from
 * @returns An object mapping the name of each form field to its value(s)
 *
 * @example
 * let formNode = document.getElementById('aForm');
 * let values = form.toObject(formNode);
 * console.log(values.firstName); // 'foo'
 */
export function toObject(form: HTMLFormElement): FormValue {
	const value: FormValue = {};
	const elements = form.elements;

	for (let i = 0; i < elements.length; i++) {
		const element = <HTMLInputElement> elements[i];
		if (element.name && !(element.type in EXCLUDED_TAGS) && !element.disabled) {
			storeFieldValue(value, element);
		}
	}

	return value;
}
