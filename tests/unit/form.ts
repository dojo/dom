import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import * as form from 'src/form';

type FormValue = { [ key: string ]: any };

let testForm: HTMLFormElement;

registerSuite({
	name: 'form',

	setup() {
		testForm = document.createElement('form');
	},

	'.fromObject': {
		capitalization() {
			testForm.innerHTML = `
				<input name="text1" type="TEXT">
				<INPUT name="text2" type="text">
			`;
			form.fromObject(testForm, { text1: 'foo', text2: 'bar' });
			assert.strictEqual(testForm['text1'].value, 'foo');
			assert.strictEqual(testForm['text2'].value, 'bar');
		},

		disabled() {
			testForm.innerHTML = `
				<input name="text" type="text">
				<input name="disabled" type="text" disabled>
			`;
			form.fromObject(testForm, { text: 'foo', disabled: 'bar' });
			assert.strictEqual(testForm['text'].value, 'foo');
			assert.strictEqual(testForm['disabled'].value, '');
		},

		checkbox() {
			testForm.innerHTML = `
				<input name="cb1" type="checkbox" value="foo">
				<input name="cb1" type="checkbox" value="bar">
				<input name="cb2" type="checkbox" value="baz">
				<input name="cb3" type="checkbox">
			`;

			// Set everything
			form.fromObject(testForm, { cb1: [ 'foo', 'bar' ], cb2: 'baz', cb3: 'on' });
			assert.isTrue(testForm['cb1'][0].checked);
			assert.isTrue(testForm['cb1'][1].checked);
			assert.isTrue(testForm['cb2'].checked);
			assert.isTrue(testForm['cb3'].checked);

			// Set nothing (should clear all checkboxes)
			form.fromObject(testForm, {});
			assert.isFalse(testForm['cb1'][0].checked);
			assert.isFalse(testForm['cb1'][1].checked);
			assert.isFalse(testForm['cb2'].checked);
			assert.isFalse(testForm['cb3'].checked);

			// Set group to single value
			form.fromObject(testForm, { cb1: 'foo' });
			assert.isTrue(testForm['cb1'][0].checked);
			assert.isFalse(testForm['cb1'][1].checked);
			assert.isFalse(testForm['cb2'].checked);
			assert.isFalse(testForm['cb3'].checked);

			// Set field to an invalid value
			form.fromObject(testForm, { cb2: 'bar' });
			assert.isFalse(testForm['cb1'][0].checked);
			assert.isFalse(testForm['cb1'][1].checked);
			assert.isFalse(testForm['cb2'].checked);
			assert.isFalse(testForm['cb3'].checked);
		},

		radio() {
			testForm.innerHTML = `
				<input name="r1" type="radio" value="foo">
				<input name="r1" type="radio" value="bar">
				<input name="r1" type="radio" value="baz">
			`;

			// Set value
			form.fromObject(testForm, { r1: 'foo' });
			assert.isTrue(testForm['r1'][0].checked);
			assert.isFalse(testForm['r1'][1].checked);
			assert.isFalse(testForm['r1'][2].checked);

			// Clear value
			form.fromObject(testForm, {});
			assert.isFalse(testForm['r1'][0].checked);
			assert.isFalse(testForm['r1'][1].checked);
			assert.isFalse(testForm['r1'][2].checked);
		},

		'select-single': (function () {
			function runTest(object: { [ key: string ]: any }, index: number, value: string) {
				form.fromObject(testForm, object);
				assert.strictEqual(testForm['select'].selectedIndex, index);
				assert.strictEqual(testForm['select'].value, value);
			}

			return {
				flat() {
					testForm.innerHTML = `
						<select name="select">
							<option value="foo">foo</option>
							<option value="bar">bar</option>
							<option value="baz">baz</option>
							<option value="qux">qux</option>
						</select>
					`;
					runTest({ select: 'bar' }, 1, 'bar');
				},

				group() {
					testForm.innerHTML = `
						<select name="select">
							<option value="foo">foo</option>
							<optgroup label="stuff">
								<option value="bar">bar</option>
								<option value="baz">baz</option>
							</optgroup>
							<optgroup label="stuff">
								<option value="qux">qux</option>
							</optgroup>
						</select>
					`;
					runTest({ select: 'bar' }, 1, 'bar');
				},

				clear() {
					testForm.innerHTML = `
						<select name="select">
							<option value="foo">foo</option>
							<option value="bar">bar</option>
							<option value="baz">baz</option>
						</select>
					`;
					runTest({}, 0, 'foo');
				},

				'clear with disabled first option'() {
					testForm.innerHTML = `
						<select name="select">
							<option disabled value="foo">foo</option>
							<option value="bar">bar</option>
							<option value="baz">baz</option>
						</select>
					`;
					runTest({}, 1, 'bar');
				},

				'clear with disabled first option and optgroup'() {
					testForm.innerHTML = `
						<select name="select">
							<optgroup label="first">
								<option disabled value="foo">foo</option>
								<option value="bar">bar</option>
							</optgroup>
							<optgroup label="second">
								<option value="baz">baz</option>
							</optgroup>
						</select>
					`;
					runTest({}, 1, 'bar');
				}
			};
		})(),

		'select-multiple': (function () {
			function runTest() {
				const options = testForm['select'].options;

				// Set single value
				form.fromObject(testForm, { select: 'foo' });
				assert.isTrue(options[0].selected);
				assert.isFalse(options[1].selected);
				assert.isFalse(options[2].selected);
				assert.isFalse(options[3].selected);

				// Set multiple values
				form.fromObject(testForm, { select: [ 'bar', 'baz' ] });
				assert.isFalse(options[0].selected);
				assert.isTrue(options[1].selected);
				assert.isTrue(options[2].selected);
				assert.isFalse(options[3].selected);
			}

			return {
				flat() {
					testForm.innerHTML = `
						<select multiple name="select">
							<option value="foo">foo</option>
							<option value="bar">bar</option>
							<option value="baz">baz</option>
							<option value="qux">qux</option>
						</select>
					`;
					runTest();
				},

				group() {
					testForm.innerHTML = `
						<select multiple name="select">
							<option value="foo">foo</option>
							<optgroup label="stuff">
								<option value="bar">bar</option>
								<option value="baz">baz</option>
							</optgroup>
							<optgroup label="stuff">
								<option value="qux">qux</option>
							</optgroup>
						</select>
					`;
					runTest();
				},

				clear() {
					testForm.innerHTML = `
						<select multiple name="select">
							<option value="foo">foo</option>
							<option value="bar">bar</option>
						</select>
					`;
					form.fromObject(testForm, {});
					const options = testForm['select'].options;
					assert.isFalse(options[0].selected);
					assert.isFalse(options[1].selected);
				}
			};
		})(),

		text() {
			testForm.innerHTML = `
				<input name="text" type="text">
				<input name="hidden" type="hidden">
				<input name="password" type="password">
				<input name="implicit">
			`;
			const expected = <FormValue> {
				text: 'foo',
				hidden: 'bar',
				password: 'baz',
				implicit: 'qux'
			};

			form.fromObject(testForm, expected);
			for (const name in expected) {
				assert.strictEqual(testForm[name].value, expected[name]);
			}
		}
	},

	'.toObject': {
		capitalization() {
			testForm.innerHTML = `
				<input name="text1" type="TEXT" value="foo">
				<INPUT name="text2" type="text" value="bar">
				<input name="text3" type="text" VALUE="baz">
			`;
			assert.deepEqual(form.toObject(testForm), { text1: 'foo', text2: 'bar', text3: 'baz' });
		},

		disabled() {
			testForm.innerHTML = `
				<input name="text" type="text" value="foo">
				<input name="disabled" type="text" value="bar" disabled>
			`;
			assert.deepEqual(form.toObject(testForm), { text: 'foo' });
		},

		checkbox: {
			'single check'() {
				testForm.innerHTML = `
					<input name="cb1" type="checkbox" value="foo">
					<input name="cb1" type="checkbox" value="bar" checked>
				`;
				assert.deepEqual(form.toObject(testForm), { cb1: [ 'bar' ] });
			},

			'multiple checks'() {
				testForm.innerHTML = `
					<input name="cb1" type="checkbox" value="foo" checked>
					<input name="cb1" type="checkbox" value="bar" checked>
					<input name="cb1" type="checkbox" value="baz" checked>
					<input name="cb1" type="checkbox" value="qux">
				`;
				assert.deepEqual(form.toObject(testForm), { cb1: [ 'foo', 'bar', 'baz' ] });
			},

			'implicit value'() {
				testForm.innerHTML = '<input name="implicit" type="checkbox" checked>';
				assert.deepEqual(form.toObject(testForm), { implicit: 'on' });
			}
		},

		radio() {
			testForm.innerHTML = `
				<input name="r1" type="radio" value="foo">
				<input name="r1" type="radio" value="bar" checked>
				<input name="r1" type="radio" value="baz">
			`;
			assert.deepEqual(form.toObject(testForm), { r1: 'bar' });

		},

		'select-single': {
			flat() {
				testForm.innerHTML = `
					<select name="select">
						<option value="foo">foo</option>
						<option value="bar" selected>bar</option>
						<option value="baz">baz</option>
						<option value="qux">qux</option>
					</select>
				`;
				assert.deepEqual(form.toObject(testForm), { select: 'bar' });
			},

			group() {
				testForm.innerHTML = `
					<select name="select">
						<option value="foo">foo</option>
						<optgroup label="stuff">
							<option value="bar" selected>bar</option>
							<option value="baz">baz</option>
						</optgroup>
						<optgroup label="stuff">
							<option value="qux">qux</option>
						</optgroup>
					</select>
				`;
				assert.deepEqual(form.toObject(testForm), { select: 'bar' });
			}
		},

		'select-multiple': {
			none() {
				testForm.innerHTML = `
					<select multiple name="select">
						<option value="foo">foo</option>
						<option value="bar">bar</option>
					</select>
				`;
				assert.deepEqual(form.toObject(testForm), {});
			},

			single() {
				testForm.innerHTML = `
					<select multiple name="select">
						<option value="foo">foo</option>
						<option value="bar" selected>bar</option>
						<option value="baz">baz</option>
						<option value="qux">qux</option>
					</select>
				`;
				assert.deepEqual(form.toObject(testForm), { select: [ 'bar' ] });
			},

			flat() {
				testForm.innerHTML = `
					<select multiple name="select">
						<option value="foo">foo</option>
						<option value="bar" selected>bar</option>
						<option value="baz">baz</option>
						<option value="qux" selected>qux</option>
					</select>
				`;
				assert.deepEqual(form.toObject(testForm), { select: [ 'bar', 'qux' ] });
			},

			group() {
				testForm.innerHTML = `
					<select multiple name="select">
						<option value="foo">foo</option>
						<optgroup label="stuff">
							<option value="bar" selected>bar</option>
							<option value="baz">baz</option>
						</optgroup>
						<optgroup label="stuff">
							<option value="qux" selected>qux</option>
						</optgroup>
					</select>
				`;
				assert.deepEqual(form.toObject(testForm), { select: [ 'bar', 'qux' ] });
			}
		},

		text() {
			testForm.innerHTML = `
				<input name="text" type="text" value="foo">
				<input name="hidden" type="hidden" value="bar">
				<input name="password" type="password" value="baz">
				<input name="implicit" value="qux">
				<input name="empty">
			`;
			assert.deepEqual(form.toObject(testForm), {
				text: 'foo',
				hidden: 'bar',
				password: 'baz',
				implicit: 'qux',
				empty: ''
			});
		}
	},

	'to and from'() {
		testForm.innerHTML = `
			<input name="text" type="text">
			<input name="hidden" type="hidden">
			<input name="password" type="password">
			<input name="implicit">
			<input name="empty">

			<input name="cb1" type="checkbox" value="foo">
			<input name="cb1" type="checkbox" value="bar">

			<input name="r1" type="radio" value="foo">
			<input name="r1" type="radio" value="bar">
			<input name="r1" type="radio" value="baz">

			<select name="select">
				<option value="foo">foo</option>
				<option value="bar">bar</option>
				<option value="baz">baz</option>
				<option value="qux">qux</option>
			</select>

			<select multiple name="multiselect">
				<option value="foo">foo</option>
				<option value="bar">bar</option>
				<option value="baz">baz</option>
				<option value="qux">qux</option>
			</select>
		`;

		const value = <FormValue> {
			text: 'text-foo',
			hidden: 'hidden-foo',
			password: 'password-foo',
			implicit: 'implicit-foo',
			cb1: [ 'bar' ],
			r1: 'foo',
			select: 'qux',
			multiselect: [ 'foo', 'baz' ]
		};

		form.fromObject(testForm, value);

		value['empty'] = '';
		assert.deepEqual(form.toObject(testForm), value);
	}
});
