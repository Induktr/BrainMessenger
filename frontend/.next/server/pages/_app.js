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
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AppApolloProvider: () => (/* binding */ AppApolloProvider),\n/* harmony export */   createApolloClient: () => (/* binding */ createApolloClient),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @apollo/client */ \"@apollo/client\");\n/* harmony import */ var _apollo_client__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_apollo_client__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _apollo_client_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @apollo/client/react */ \"@apollo/client/react\");\n/* harmony import */ var _apollo_client_react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_apollo_client_react__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _apollo_client_link_subscriptions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @apollo/client/link/subscriptions */ \"@apollo/client/link/subscriptions\");\n/* harmony import */ var _apollo_client_link_subscriptions__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_apollo_client_link_subscriptions__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _apollo_client_utilities__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @apollo/client/utilities */ \"@apollo/client/utilities\");\n/* harmony import */ var _apollo_client_utilities__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_apollo_client_utilities__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var graphql_ws__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! graphql-ws */ \"graphql-ws\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([graphql_ws__WEBPACK_IMPORTED_MODULE_6__]);\ngraphql_ws__WEBPACK_IMPORTED_MODULE_6__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n // Добавлен useMemo\n\n\n\n\n\nconst httpUrl = \"http://localhost:4000/graphql\" || 0;\nconst wsUrl = \"ws://localhost:4000/graphql\" || 0;\n// Функция для создания экземпляра Apollo Client\nfunction createApolloClient() {\n    const httpLink = new _apollo_client__WEBPACK_IMPORTED_MODULE_2__.HttpLink({\n        uri: httpUrl\n    });\n    // Создаем wsLink только на клиенте\n    const wsLink =  false ? 0 : undefined; // undefined на сервере\n    // Используем splitLink для разделения запросов\n    const link =  false ? 0 : httpLink; // Использовать только httpLink на сервере\n    return new _apollo_client__WEBPACK_IMPORTED_MODULE_2__.ApolloClient({\n        link: link,\n        cache: new _apollo_client__WEBPACK_IMPORTED_MODULE_2__.InMemoryCache(),\n        ssrMode: \"undefined\" === 'undefined'\n    });\n}\nfunction AppApolloProvider({ children }) {\n    // Используем useMemo для создания клиента один раз на клиенте\n    // и для каждого запроса на сервере\n    const client = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)({\n        \"AppApolloProvider.useMemo[client]\": ()=>createApolloClient()\n    }[\"AppApolloProvider.useMemo[client]\"], []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_apollo_client_react__WEBPACK_IMPORTED_MODULE_3__.ApolloProvider, {\n        client: client,\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\BrainMessenger\\\\frontend\\\\providers\\\\ApolloProvider.tsx\",\n        lineNumber: 60,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AppApolloProvider);\n// Экспортируем функцию создания клиента, если она понадобится в getStaticProps/getServerSideProps\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3Byb3ZpZGVycy9BcG9sbG9Qcm92aWRlci50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBa0QsQ0FBQyxtQkFBbUI7QUFDb0I7QUFDcEM7QUFDWTtBQUNMO0FBQ25CO0FBUTFDLE1BQU1VLFVBQVVDLCtCQUFtQyxJQUFJLENBQStCO0FBQ3RGLE1BQU1HLFFBQVFILDZCQUE4QixJQUFJLENBQTZCO0FBRTdFLGdEQUFnRDtBQUNoRCxTQUFTSztJQUNQLE1BQU1DLFdBQVcsSUFBSWIsb0RBQVFBLENBQUM7UUFDNUJjLEtBQUtSO0lBQ1A7SUFFQSxtQ0FBbUM7SUFDbkMsTUFBTVMsU0FBUyxNQUE2QixHQUN4QyxDQUlBLEdBQ0NFLFdBQVcsdUJBQXVCO0lBRXZDLCtDQUErQztJQUMvQyxNQUFNQyxPQUFPLE1BQXVDSCxHQUNoRGQsQ0FTRVksR0FFRkEsVUFBVSwwQ0FBMEM7SUFFeEQsT0FBTyxJQUFJZix3REFBWUEsQ0FBQztRQUN0Qm9CLE1BQU1BO1FBQ05LLE9BQU8sSUFBSXhCLHlEQUFhQTtRQUN4QnlCLFNBQVMsZ0JBQWtCO0lBQzdCO0FBQ0Y7QUFFTyxTQUFTQyxrQkFBa0IsRUFBRUMsUUFBUSxFQUF1QjtJQUNqRSw4REFBOEQ7SUFDOUQsbUNBQW1DO0lBQ25DLE1BQU1DLFNBQVM5Qiw4Q0FBT0E7NkNBQUMsSUFBTWU7NENBQXNCLEVBQUU7SUFFckQscUJBQ0UsOERBQUNWLGdFQUFjQTtRQUFDeUIsUUFBUUE7a0JBQ3JCRDs7Ozs7O0FBR1A7QUFFQSxpRUFBZUQsaUJBQWlCQSxFQUFDO0FBRWpDLGtHQUFrRztBQUNwRSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFx1c2VyXFxEb3dubG9hZHNcXEFsbFByb2plY3RzXFxCcmFpbk1lc3NlbmdlclxcZnJvbnRlbmRcXHByb3ZpZGVyc1xcQXBvbGxvUHJvdmlkZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7IC8vINCU0L7QsdCw0LLQu9C10L0gdXNlTWVtb1xyXG5pbXBvcnQgeyBBcG9sbG9DbGllbnQsIEluTWVtb3J5Q2FjaGUsIEh0dHBMaW5rLCBzcGxpdCwgQXBvbGxvTGluayB9IGZyb20gJ0BhcG9sbG8vY2xpZW50JztcclxuaW1wb3J0IHsgQXBvbGxvUHJvdmlkZXIgfSBmcm9tICdAYXBvbGxvL2NsaWVudC9yZWFjdCc7XHJcbmltcG9ydCB7IEdyYXBoUUxXc0xpbmsgfSBmcm9tICdAYXBvbGxvL2NsaWVudC9saW5rL3N1YnNjcmlwdGlvbnMnO1xyXG5pbXBvcnQgeyBnZXRNYWluRGVmaW5pdGlvbiB9IGZyb20gJ0BhcG9sbG8vY2xpZW50L3V0aWxpdGllcyc7XHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ2dyYXBocWwtd3MnO1xyXG4vLyDQo9Cx0YDQsNC9INC40LzQv9C+0YDRgiBBcHBQcm92aWRlcnMsINGC0LDQuiDQutCw0Log0L7QvSDQvdC1INC40YHQv9C+0LvRjNC30YPQtdGC0YHRjyDQt9C00LXRgdGMXHJcbi8vIGltcG9ydCBBcHBQcm92aWRlcnMgZnJvbSAnLi9Qcm92aWRlcnMnO1xyXG5cclxuaW50ZXJmYWNlIEFwb2xsb1Byb3ZpZGVyUHJvcHMge1xyXG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XHJcbn1cclxuXHJcbmNvbnN0IGh0dHBVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19HUkFQSFFMX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo0MDAwL2dyYXBocWwnO1xyXG5jb25zdCB3c1VybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1dTX1VSTCB8fCAnd3M6Ly9sb2NhbGhvc3Q6NDAwMC9ncmFwaHFsJztcclxuXHJcbi8vINCk0YPQvdC60YbQuNGPINC00LvRjyDRgdC+0LfQtNCw0L3QuNGPINGN0LrQt9C10LzQv9C70Y/RgNCwIEFwb2xsbyBDbGllbnRcclxuZnVuY3Rpb24gY3JlYXRlQXBvbGxvQ2xpZW50KCkge1xyXG4gIGNvbnN0IGh0dHBMaW5rID0gbmV3IEh0dHBMaW5rKHtcclxuICAgIHVyaTogaHR0cFVybCxcclxuICB9KTtcclxuXHJcbiAgLy8g0KHQvtC30LTQsNC10Lwgd3NMaW5rINGC0L7Qu9GM0LrQviDQvdCwINC60LvQuNC10L3RgtC1XHJcbiAgY29uc3Qgd3NMaW5rID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcclxuICAgID8gbmV3IEdyYXBoUUxXc0xpbmsoXHJcbiAgICAgIGNyZWF0ZUNsaWVudCh7XHJcbiAgICAgICAgdXJsOiB3c1VybCxcclxuICAgICAgICAvLyBPcHRpb25hbDogY29ubmVjdGlvblBhcmFtcywga2VlcEFsaXZlLCBldGMuXHJcbiAgICAgIH0pXHJcbiAgICApOiB1bmRlZmluZWQ7IC8vIHVuZGVmaW5lZCDQvdCwINGB0LXRgNCy0LXRgNC1XHJcblxyXG4gIC8vINCY0YHQv9C+0LvRjNC30YPQtdC8IHNwbGl0TGluayDQtNC70Y8g0YDQsNC30LTQtdC70LXQvdC40Y8g0LfQsNC/0YDQvtGB0L7QslxyXG4gIGNvbnN0IGxpbmsgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3c0xpbmtcclxuICAgID8gc3BsaXQoXHJcbiAgICAgICAgKHsgcXVlcnkgfSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGdldE1haW5EZWZpbml0aW9uKHF1ZXJ5KTtcclxuICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIGRlZmluaXRpb24ua2luZCA9PT0gJ09wZXJhdGlvbkRlZmluaXRpb24nICYmXHJcbiAgICAgICAgICAgIGRlZmluaXRpb24ub3BlcmF0aW9uID09PSAnc3Vic2NyaXB0aW9uJ1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdzTGluaywgLy8g0JjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMIHdzTGluayDQtNC70Y8g0L/QvtC00L/QuNGB0L7QulxyXG4gICAgICAgIGh0dHBMaW5rLCAvLyDQmNGB0L/QvtC70YzQt9C+0LLQsNGC0YwgaHR0cExpbmsg0LTQu9GPINC+0YHRgtCw0LvRjNC90L7Qs9C+XHJcbiAgICAgIClcclxuICAgIDogaHR0cExpbms7IC8vINCY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDRgtC+0LvRjNC60L4gaHR0cExpbmsg0L3QsCDRgdC10YDQstC10YDQtVxyXG5cclxuICByZXR1cm4gbmV3IEFwb2xsb0NsaWVudCh7XHJcbiAgICBsaW5rOiBsaW5rLCAvLyDQmNGB0L/QvtC70YzQt9GD0LXQvCDRgdC+0LfQtNCw0L3QvdGL0LkgbGlua1xyXG4gICAgY2FjaGU6IG5ldyBJbk1lbW9yeUNhY2hlKCksXHJcbiAgICBzc3JNb2RlOiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJywgLy8g0JLQsNC20L3QviDQtNC70Y8gU1NSXHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBBcHBBcG9sbG9Qcm92aWRlcih7IGNoaWxkcmVuIH06IEFwb2xsb1Byb3ZpZGVyUHJvcHMpIHtcclxuICAvLyDQmNGB0L/QvtC70YzQt9GD0LXQvCB1c2VNZW1vINC00LvRjyDRgdC+0LfQtNCw0L3QuNGPINC60LvQuNC10L3RgtCwINC+0LTQuNC9INGA0LDQtyDQvdCwINC60LvQuNC10L3RgtC1XHJcbiAgLy8g0Lgg0LTQu9GPINC60LDQttC00L7Qs9C+INC30LDQv9GA0L7RgdCwINC90LAg0YHQtdGA0LLQtdGA0LVcclxuICBjb25zdCBjbGllbnQgPSB1c2VNZW1vKCgpID0+IGNyZWF0ZUFwb2xsb0NsaWVudCgpLCBbXSk7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8QXBvbGxvUHJvdmlkZXIgY2xpZW50PXtjbGllbnR9PlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L0Fwb2xsb1Byb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFwcEFwb2xsb1Byb3ZpZGVyO1xyXG5cclxuLy8g0K3QutGB0L/QvtGA0YLQuNGA0YPQtdC8INGE0YPQvdC60YbQuNGOINGB0L7Qt9C00LDQvdC40Y8g0LrQu9C40LXQvdGC0LAsINC10YHQu9C4INC+0L3QsCDQv9C+0L3QsNC00L7QsdC40YLRgdGPINCyIGdldFN0YXRpY1Byb3BzL2dldFNlcnZlclNpZGVQcm9wc1xyXG5leHBvcnQgeyBjcmVhdGVBcG9sbG9DbGllbnQgfTtcclxuIl0sIm5hbWVzIjpbIlJlYWN0IiwidXNlTWVtbyIsIkFwb2xsb0NsaWVudCIsIkluTWVtb3J5Q2FjaGUiLCJIdHRwTGluayIsInNwbGl0IiwiQXBvbGxvUHJvdmlkZXIiLCJHcmFwaFFMV3NMaW5rIiwiZ2V0TWFpbkRlZmluaXRpb24iLCJjcmVhdGVDbGllbnQiLCJodHRwVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX0dSQVBIUUxfVVJMIiwid3NVcmwiLCJORVhUX1BVQkxJQ19XU19VUkwiLCJjcmVhdGVBcG9sbG9DbGllbnQiLCJodHRwTGluayIsInVyaSIsIndzTGluayIsInVybCIsInVuZGVmaW5lZCIsImxpbmsiLCJxdWVyeSIsImRlZmluaXRpb24iLCJraW5kIiwib3BlcmF0aW9uIiwiY2FjaGUiLCJzc3JNb2RlIiwiQXBwQXBvbGxvUHJvdmlkZXIiLCJjaGlsZHJlbiIsImNsaWVudCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-node)/./providers/ApolloProvider.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./providers/Providers.tsx":
/*!*********************************!*\
  !*** ./providers/Providers.tsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nfunction AppProviders({ children }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((react__WEBPACK_IMPORTED_MODULE_1___default().Fragment), {\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\BrainMessenger\\\\frontend\\\\providers\\\\Providers.tsx\",\n        lineNumber: 9,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AppProviders);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3Byb3ZpZGVycy9Qcm92aWRlcnMudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUF5QztBQU16QyxTQUFTQyxhQUFhLEVBQUVDLFFBQVEsRUFBcUI7SUFDbkQscUJBQ0UsOERBQUNGLHVEQUFjO2tCQUFFRTs7Ozs7O0FBRXJCO0FBRUEsaUVBQWVELFlBQVlBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdXNlclxcRG93bmxvYWRzXFxBbGxQcm9qZWN0c1xcQnJhaW5NZXNzZW5nZXJcXGZyb250ZW5kXFxwcm92aWRlcnNcXFByb3ZpZGVycy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcblxuaW50ZXJmYWNlIEFwcFByb3ZpZGVyc1Byb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn1cblxuZnVuY3Rpb24gQXBwUHJvdmlkZXJzKHsgY2hpbGRyZW4gfTogQXBwUHJvdmlkZXJzUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuRnJhZ21lbnQ+e2NoaWxkcmVufTwvUmVhY3QuRnJhZ21lbnQ+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFByb3ZpZGVyczsiXSwibmFtZXMiOlsiUmVhY3QiLCJBcHBQcm92aWRlcnMiLCJjaGlsZHJlbiIsIkZyYWdtZW50Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./providers/Providers.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../providers/ApolloProvider */ \"(pages-dir-node)/./providers/ApolloProvider.tsx\");\n/* harmony import */ var _providers_Providers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../providers/Providers */ \"(pages-dir-node)/./providers/Providers.tsx\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_1__]);\n_providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n// Import the wrapper provider we created earlier\n\n // Keep AppProviders if needed\n\nfunction MyApp({ Component, pageProps }) {\n    return(// Use the AppApolloProvider which contains the ApolloProvider and client logic\n    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_providers_ApolloProvider__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_providers_Providers__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\BrainMessenger\\\\frontend\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 13,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\BrainMessenger\\\\frontend\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 12,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\user\\\\Downloads\\\\AllProjects\\\\BrainMessenger\\\\frontend\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 10,\n        columnNumber: 5\n    }, this));\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFpRDtBQUNjO0FBQ1YsQ0FBQyw4QkFBOEI7QUFDckQ7QUFFL0IsU0FBU0UsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUMvQyxPQUNFLCtFQUErRTtrQkFDL0UsOERBQUNKLGlFQUFpQkE7a0JBRWhCLDRFQUFDQyw0REFBWUE7c0JBQ1gsNEVBQUNFO2dCQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJaEM7QUFFQSxpRUFBZUYsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFx1c2VyXFxEb3dubG9hZHNcXEFsbFByb2plY3RzXFxCcmFpbk1lc3NlbmdlclxcZnJvbnRlbmRcXHNyY1xccGFnZXNcXF9hcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBcHAsIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCc7XHJcbi8vIEltcG9ydCB0aGUgd3JhcHBlciBwcm92aWRlciB3ZSBjcmVhdGVkIGVhcmxpZXJcclxuaW1wb3J0IEFwcEFwb2xsb1Byb3ZpZGVyIGZyb20gJy4uLy4uL3Byb3ZpZGVycy9BcG9sbG9Qcm92aWRlcic7XHJcbmltcG9ydCBBcHBQcm92aWRlcnMgZnJvbSAnLi4vLi4vcHJvdmlkZXJzL1Byb3ZpZGVycyc7IC8vIEtlZXAgQXBwUHJvdmlkZXJzIGlmIG5lZWRlZFxyXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XHJcblxyXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XHJcbiAgcmV0dXJuIChcclxuICAgIC8vIFVzZSB0aGUgQXBwQXBvbGxvUHJvdmlkZXIgd2hpY2ggY29udGFpbnMgdGhlIEFwb2xsb1Byb3ZpZGVyIGFuZCBjbGllbnQgbG9naWNcclxuICAgIDxBcHBBcG9sbG9Qcm92aWRlcj5cclxuICAgICAgey8qIEtlZXAgQXBwUHJvdmlkZXJzIGlmIGl0IHdyYXBzIG90aGVyIGNvbnRleHRzICovfVxyXG4gICAgICA8QXBwUHJvdmlkZXJzPlxyXG4gICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cclxuICAgICAgPC9BcHBQcm92aWRlcnM+XHJcbiAgICA8L0FwcEFwb2xsb1Byb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwOyJdLCJuYW1lcyI6WyJBcHBBcG9sbG9Qcm92aWRlciIsIkFwcFByb3ZpZGVycyIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

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