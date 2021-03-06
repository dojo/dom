export * from './intern';

export const environments = [
	{ browserName: 'internet explorer', version: [ '11.0' ], platform: 'Windows 7' },
	{ browserName: 'MicrosoftEdge', platform: 'Windows 10' },
	{ browserName: 'firefox', version: '43', platform: 'Windows 10' },
	{ browserName: 'chrome', platform: 'Windows 10' },
	{ browserName: 'safari', version: '9.0', platform: 'OS X 10.11' },
	{ browserName: 'iphone', version: '9.3' }
];

/* SauceLabs supports more max concurrency */
export const maxConcurrency = 4;

export const tunnel = 'SauceLabsTunnel';
