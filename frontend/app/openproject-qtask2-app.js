// main app

var requireComponent = require.context('./components/', true, /^((?!\.(test|spec)).)*\.(js|ts)$/);
requireComponent.keys().forEach(requireComponent);
