import '@testing-library/jest-dom/extend-expect';
jest.mock('next/router', () => require('next-router-mock'));
global.fetch = jest.fn();
Element.prototype.scrollTo = () => {};
