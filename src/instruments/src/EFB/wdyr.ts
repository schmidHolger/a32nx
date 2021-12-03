/// <reference types="@welldone-software/why-did-you-render" />

import whyDidYouRender from '@welldone-software/why-did-you-render';
import { Provider } from 'react-redux';

import React from 'react';

// Make sure to only include the library in development

// if (process.env.NODE_ENV === 'development') {
// const whyDidYouRender = require('@welldone-software/why-did-you-render');

console.log(`process.env.NODE_ENV=${process.env.NODE_ENV}`);

whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackExtraHooks: [
        [Provider, 'useSelector'],
    ],
});
console.log('WDYR active');
// }
