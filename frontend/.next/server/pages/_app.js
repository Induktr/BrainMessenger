/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./providers/ApolloProvider.tsx":
/*!**************************************!*\
  !*** ./providers/ApolloProvider.tsx ***!
  \**************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AppApolloProvider: () => (/* binding */ AppApolloProvider),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @apollo/client */ \"@apollo/client\");\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_apollo_client__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _apollo_client_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @apollo/client/react */ \"@apollo/client/react\");\n/* harmony import */ var _apollo_client_react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_apollo_client_react__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _apollo_client_link_subscriptions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @apollo/client/link/subscriptions */ \"@apollo/client/link/subscriptions\");\n/* harmony import */ var _apollo_client_link_subscriptions__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_apollo_client_link_subscriptions__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _apollo_client_utilities__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @apollo/client/utilities */ \"@apollo/client/utilities\");\n/* harmony import */ var _apollo_client_utilities__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_apollo_client_utilities__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var graphql_ws__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! graphql-ws */ \"graphql-ws\");\n/* harmony import */ var _Providers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Providers */ \"(pages-dir-node)/./providers/Providers.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([graphql_ws__WEBPACK_IMPORTED_MODULE_6__]);\ngraphql_ws__WEBPACK_IMPORTED_MODULE_6__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n\n\n\nconst httpUrl = \"https://psfoqtuvxhmctfveouif.graphql.eu-central-1.nhost.run/v1\" || 0;\nconst wsUrl = \"ws://localhost:4000/graphql\" || 0;\nconst httpLink = new _apollo_client__WEBPACK_IMPORTED_MODULE_2__.HttpLink({\n    uri: httpUrl\n});\n// Re-enable wsLink and splitLink\nconst wsLink =  false ? 0 : undefined; // Assign undefined on the server\n// Use splitLink to route subscriptions via wsLink and other operations via httpLink\nconst splitLink =  false ? 0 : httpLink; // Fallback to httpLink on the server or if wsLink is undefined\nconst client = new _apollo_client__WEBPACK_IMPORTED_MODULE_2__.ApolloClient({\n    link: splitLink,\n    cache: new _apollo_client__WEBPACK_IMPORTED_MODULE_2__.InMemoryCache()\n});\nfunction AppApolloProvider({ children }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_apollo_client_react__WEBPACK_IMPORTED_MODULE_3__.ApolloProvider, {\n        client: client,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_Providers__WEBPACK_IMPORTED_MODULE_7__[\"default\"], {\n            children: children\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\StackDevelopment\\\\Typescript\\\\BrainMessengerProject\\\\Versions\\\\BrainMessenger\\\\frontend\\\\providers\\\\ApolloProvider.tsx\",\n            lineNumber: 53,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\StackDevelopment\\\\Typescript\\\\BrainMessengerProject\\\\Versions\\\\BrainMessenger\\\\frontend\\\\providers\\\\ApolloProvider.tsx\",\n        lineNumber: 52,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AppApolloProvider);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3Byb3ZpZGVycy9BcG9sbG9Qcm92aWRlci50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBeUM7QUFDaUQ7QUFDcEM7QUFDWTtBQUNMO0FBQ25CO0FBQ0g7QUFNdkMsTUFBTVUsVUFBVUMsZ0VBQW1DLElBQUksQ0FBK0I7QUFDdEYsTUFBTUcsUUFBUUgsNkJBQThCLElBQUksQ0FBNkI7QUFFN0UsTUFBTUssV0FBVyxJQUFJYixvREFBUUEsQ0FBQztJQUM1QmMsS0FBS1A7QUFDUDtBQUVBLGlDQUFpQztBQUNqQyxNQUFNUSxTQUFTLE1BQTZCLEdBQ3hDLENBSUEsR0FFQUUsV0FBVyxpQ0FBaUM7QUFFaEQsb0ZBQW9GO0FBQ3BGLE1BQU1DLFlBQVksTUFBdUNILEdBQ3JEZCxDQVNFWSxHQUVGQSxVQUFVLCtEQUErRDtBQUU3RSxNQUFNVSxTQUFTLElBQUl6Qix3REFBWUEsQ0FBQztJQUM5QjBCLE1BQU1OO0lBQ05PLE9BQU8sSUFBSTFCLHlEQUFhQTtBQUMxQjtBQUVPLFNBQVMyQixrQkFBa0IsRUFBRUMsUUFBUSxFQUF1QjtJQUNqRSxxQkFDRSw4REFBQ3pCLGdFQUFjQTtRQUFDcUIsUUFBUUE7a0JBQ3RCLDRFQUFDakIsa0RBQVlBO3NCQUFFcUI7Ozs7Ozs7Ozs7O0FBR3JCO0FBRUEsaUVBQWVELGlCQUFpQkEsRUFBQyIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFx1c2VyXFxEb3dubG9hZHNcXEFsbFByb2plY3RzXFxTdGFja0RldmVsb3BtZW50XFxUeXBlc2NyaXB0XFxCcmFpbk1lc3NlbmdlclByb2plY3RcXFZlcnNpb25zXFxCcmFpbk1lc3NlbmdlclxcZnJvbnRlbmRcXHByb3ZpZGVyc1xcQXBvbGxvUHJvdmlkZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IEFwb2xsb0NsaWVudCwgSW5NZW1vcnlDYWNoZSwgSHR0cExpbmssIHNwbGl0LCBBcG9sbG9MaW5rIH0gZnJvbSAnQGFwb2xsby9jbGllbnQnO1xyXG5pbXBvcnQgeyBBcG9sbG9Qcm92aWRlciB9IGZyb20gJ0BhcG9sbG8vY2xpZW50L3JlYWN0JztcclxuaW1wb3J0IHsgR3JhcGhRTFdzTGluayB9IGZyb20gJ0BhcG9sbG8vY2xpZW50L2xpbmsvc3Vic2NyaXB0aW9ucyc7XHJcbmltcG9ydCB7IGdldE1haW5EZWZpbml0aW9uIH0gZnJvbSAnQGFwb2xsby9jbGllbnQvdXRpbGl0aWVzJztcclxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnZ3JhcGhxbC13cyc7XHJcbmltcG9ydCBBcHBQcm92aWRlcnMgZnJvbSAnLi9Qcm92aWRlcnMnO1xyXG5cclxuaW50ZXJmYWNlIEFwb2xsb1Byb3ZpZGVyUHJvcHMge1xyXG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XHJcbn1cclxuXHJcbmNvbnN0IGh0dHBVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19HUkFQSFFMX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo0MDAwL2dyYXBocWwnO1xyXG5jb25zdCB3c1VybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1dTX1VSTCB8fCAnd3M6Ly9sb2NhbGhvc3Q6NDAwMC9ncmFwaHFsJztcclxuXHJcbmNvbnN0IGh0dHBMaW5rID0gbmV3IEh0dHBMaW5rKHtcclxuICB1cmk6IGh0dHBVcmwsXHJcbn0pO1xyXG5cclxuLy8gUmUtZW5hYmxlIHdzTGluayBhbmQgc3BsaXRMaW5rXHJcbmNvbnN0IHdzTGluayA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXHJcbiAgPyBuZXcgR3JhcGhRTFdzTGluayhcclxuICAgIGNyZWF0ZUNsaWVudCh7XHJcbiAgICAgIHVybDogd3NVcmwsXHJcbiAgICAgIC8vIE9wdGlvbmFsOiBjb25uZWN0aW9uUGFyYW1zLCBrZWVwQWxpdmUsIGV0Yy5cclxuICAgIH0pXHJcbiAgKVxyXG4gIDogdW5kZWZpbmVkOyAvLyBBc3NpZ24gdW5kZWZpbmVkIG9uIHRoZSBzZXJ2ZXJcclxuXHJcbi8vIFVzZSBzcGxpdExpbmsgdG8gcm91dGUgc3Vic2NyaXB0aW9ucyB2aWEgd3NMaW5rIGFuZCBvdGhlciBvcGVyYXRpb25zIHZpYSBodHRwTGlua1xyXG5jb25zdCBzcGxpdExpbmsgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3c0xpbmtcclxuICA/IHNwbGl0KFxyXG4gICAgICAoeyBxdWVyeSB9KSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGdldE1haW5EZWZpbml0aW9uKHF1ZXJ5KTtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgZGVmaW5pdGlvbi5raW5kID09PSAnT3BlcmF0aW9uRGVmaW5pdGlvbicgJiZcclxuICAgICAgICAgIGRlZmluaXRpb24ub3BlcmF0aW9uID09PSAnc3Vic2NyaXB0aW9uJ1xyXG4gICAgICAgICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHdzTGluaywgLy8gVXNlIHdzTGluayBmb3Igc3Vic2NyaXB0aW9uc1xyXG4gICAgICBodHRwTGluaywgLy8gVXNlIGh0dHBMaW5rIGZvciBxdWVyaWVzIGFuZCBtdXRhdGlvbnNcclxuICAgIClcclxuICA6IGh0dHBMaW5rOyAvLyBGYWxsYmFjayB0byBodHRwTGluayBvbiB0aGUgc2VydmVyIG9yIGlmIHdzTGluayBpcyB1bmRlZmluZWRcclxuXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBBcG9sbG9DbGllbnQoe1xyXG4gIGxpbms6IHNwbGl0TGluaywgLy8gVXNlIHRoZSBzcGxpdExpbmtcclxuICBjYWNoZTogbmV3IEluTWVtb3J5Q2FjaGUoKSxcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQXBwQXBvbGxvUHJvdmlkZXIoeyBjaGlsZHJlbiB9OiBBcG9sbG9Qcm92aWRlclByb3BzKSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxBcG9sbG9Qcm92aWRlciBjbGllbnQ9e2NsaWVudH0+XHJcbiAgICAgIDxBcHBQcm92aWRlcnM+e2NoaWxkcmVufTwvQXBwUHJvdmlkZXJzPlxyXG4gICAgPC9BcG9sbG9Qcm92aWRlcj5cclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcHBBcG9sbG9Qcm92aWRlcjtcclxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiQXBvbGxvQ2xpZW50IiwiSW5NZW1vcnlDYWNoZSIsIkh0dHBMaW5rIiwic3BsaXQiLCJBcG9sbG9Qcm92aWRlciIsIkdyYXBoUUxXc0xpbmsiLCJnZXRNYWluRGVmaW5pdGlvbiIsImNyZWF0ZUNsaWVudCIsIkFwcFByb3ZpZGVycyIsImh0dHBVcmwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfR1JBUEhRTF9VUkwiLCJ3c1VybCIsIk5FWFRfUFVCTElDX1dTX1VSTCIsImh0dHBMaW5rIiwidXJpIiwid3NMaW5rIiwidXJsIiwidW5kZWZpbmVkIiwic3BsaXRMaW5rIiwicXVlcnkiLCJkZWZpbml0aW9uIiwia2luZCIsIm9wZXJhdGlvbiIsImNsaWVudCIsImxpbmsiLCJjYWNoZSIsIkFwcEFwb2xsb1Byb3ZpZGVyIiwiY2hpbGRyZW4iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./providers/ApolloProvider.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./providers/Providers.tsx":
/*!*********************************!*\
  !*** ./providers/Providers.tsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nfunction AppProviders({ children }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((react__WEBPACK_IMPORTED_MODULE_1___default().Fragment), {\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\StackDevelopment\\\\Typescript\\\\BrainMessengerProject\\\\Versions\\\\BrainMessenger\\\\frontend\\\\providers\\\\Providers.tsx\",\n        lineNumber: 9,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AppProviders);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3Byb3ZpZGVycy9Qcm92aWRlcnMudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUF5QztBQU16QyxTQUFTQyxhQUFhLEVBQUVDLFFBQVEsRUFBcUI7SUFDbkQscUJBQ0UsOERBQUNGLHVEQUFjO2tCQUFFRTs7Ozs7O0FBRXJCO0FBRUEsaUVBQWVELFlBQVlBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdXNlclxcRG93bmxvYWRzXFxBbGxQcm9qZWN0c1xcU3RhY2tEZXZlbG9wbWVudFxcVHlwZXNjcmlwdFxcQnJhaW5NZXNzZW5nZXJQcm9qZWN0XFxWZXJzaW9uc1xcQnJhaW5NZXNzZW5nZXJcXGZyb250ZW5kXFxwcm92aWRlcnNcXFByb3ZpZGVycy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcblxuaW50ZXJmYWNlIEFwcFByb3ZpZGVyc1Byb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn1cblxuZnVuY3Rpb24gQXBwUHJvdmlkZXJzKHsgY2hpbGRyZW4gfTogQXBwUHJvdmlkZXJzUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuRnJhZ21lbnQ+e2NoaWxkcmVufTwvUmVhY3QuRnJhZ21lbnQ+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFByb3ZpZGVyczsiXSwibmFtZXMiOlsiUmVhY3QiLCJBcHBQcm92aWRlcnMiLCJjaGlsZHJlbiIsIkZyYWdtZW50Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./providers/Providers.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/lib/apollo-provider.tsx":
/*!*************************************!*\
  !*** ./src/lib/apollo-provider.tsx ***!
  \*************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ApolloWrapper: () => (/* binding */ ApolloWrapper),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../providers/ApolloProvider */ \"(pages-dir-node)/./providers/ApolloProvider.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_2__]);\n_providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n/* __next_internal_client_entry_do_not_use__ ApolloWrapper,default auto */ \n\n // Corrected import path\nconst ApolloWrapper = ({ children })=>{\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\StackDevelopment\\\\Typescript\\\\BrainMessengerProject\\\\Versions\\\\BrainMessenger\\\\frontend\\\\src\\\\lib\\\\apollo-provider.tsx\",\n        lineNumber: 12,\n        columnNumber: 5\n    }, undefined);\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ApolloWrapper);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9saWIvYXBvbGxvLXByb3ZpZGVyLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUV5QztBQUNzQixDQUFDLHdCQUF3QjtBQU1qRixNQUFNRSxnQkFBK0MsQ0FBQyxFQUFFQyxRQUFRLEVBQUU7SUFDdkUscUJBQ0UsOERBQUNGLGlFQUFpQkE7UUFBQ0UsVUFBVUE7Ozs7OztBQUVqQyxFQUFFO0FBRUYsaUVBQWVELGFBQWFBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdXNlclxcRG93bmxvYWRzXFxBbGxQcm9qZWN0c1xcU3RhY2tEZXZlbG9wbWVudFxcVHlwZXNjcmlwdFxcQnJhaW5NZXNzZW5nZXJQcm9qZWN0XFxWZXJzaW9uc1xcQnJhaW5NZXNzZW5nZXJcXGZyb250ZW5kXFxzcmNcXGxpYlxcYXBvbGxvLXByb3ZpZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgQXBwQXBvbGxvUHJvdmlkZXIgZnJvbSAnLi4vLi4vcHJvdmlkZXJzL0Fwb2xsb1Byb3ZpZGVyJzsgLy8gQ29ycmVjdGVkIGltcG9ydCBwYXRoXG5cbmludGVyZmFjZSBBcG9sbG9Qcm92aWRlclByb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGNvbnN0IEFwb2xsb1dyYXBwZXI6IFJlYWN0LkZDPEFwb2xsb1Byb3ZpZGVyUHJvcHM+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxBcHBBcG9sbG9Qcm92aWRlciBjaGlsZHJlbj17Y2hpbGRyZW59IC8+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBcG9sbG9XcmFwcGVyO1xuIl0sIm5hbWVzIjpbIlJlYWN0IiwiQXBwQXBvbGxvUHJvdmlkZXIiLCJBcG9sbG9XcmFwcGVyIiwiY2hpbGRyZW4iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/lib/apollo-provider.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_apollo_provider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/apollo-provider */ \"(pages-dir-node)/./src/lib/apollo-provider.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_apollo_provider__WEBPACK_IMPORTED_MODULE_1__]);\n_lib_apollo_provider__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n // Use ApolloWrapper\n\nfunction MyApp({ Component, pageProps }) {\n    return(// Wrap the entire application with ApolloWrapper\n    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_lib_apollo_provider__WEBPACK_IMPORTED_MODULE_1__.ApolloWrapper, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\StackDevelopment\\\\Typescript\\\\BrainMessengerProject\\\\Versions\\\\BrainMessenger\\\\frontend\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 9,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\StackDevelopment\\\\Typescript\\\\BrainMessengerProject\\\\Versions\\\\BrainMessenger\\\\frontend\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 8,\n        columnNumber: 5\n    }, this));\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ3VELENBQUMsb0JBQW9CO0FBQzdDO0FBRS9CLFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDL0MsT0FDRSxpREFBaUQ7a0JBQ2pELDhEQUFDSCwrREFBYUE7a0JBQ1osNEVBQUNFO1lBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7QUFHOUI7QUFFQSxpRUFBZUYsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFx1c2VyXFxEb3dubG9hZHNcXEFsbFByb2plY3RzXFxTdGFja0RldmVsb3BtZW50XFxUeXBlc2NyaXB0XFxCcmFpbk1lc3NlbmdlclByb2plY3RcXFZlcnNpb25zXFxCcmFpbk1lc3NlbmdlclxcZnJvbnRlbmRcXHNyY1xccGFnZXNcXF9hcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBcHAsIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCc7XHJcbmltcG9ydCB7IEFwb2xsb1dyYXBwZXIgfSBmcm9tICcuLi9saWIvYXBvbGxvLXByb3ZpZGVyJzsgLy8gVXNlIEFwb2xsb1dyYXBwZXJcclxuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xyXG4gIHJldHVybiAoXHJcbiAgICAvLyBXcmFwIHRoZSBlbnRpcmUgYXBwbGljYXRpb24gd2l0aCBBcG9sbG9XcmFwcGVyXHJcbiAgICA8QXBvbGxvV3JhcHBlcj5cclxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgPC9BcG9sbG9XcmFwcGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwOyJdLCJuYW1lcyI6WyJBcG9sbG9XcmFwcGVyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "@apollo/client":
/*!*********************************!*\
  !*** external "@apollo/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@apollo/client");

/***/ }),

/***/ "@apollo/client/link/subscriptions":
/*!****************************************************!*\
  !*** external "@apollo/client/link/subscriptions" ***!
  \****************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@apollo/client/link/subscriptions");

/***/ }),

/***/ "@apollo/client/react":
/*!***************************************!*\
  !*** external "@apollo/client/react" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@apollo/client/react");

/***/ }),

/***/ "@apollo/client/utilities":
/*!*******************************************!*\
  !*** external "@apollo/client/utilities" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@apollo/client/utilities");

/***/ }),

/***/ "graphql-ws":
/*!*****************************!*\
  !*** external "graphql-ws" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = import("graphql-ws");;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(pages-dir-node)/./src/pages/_app.tsx"));
module.exports = __webpack_exports__;

})();