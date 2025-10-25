const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Excelファイル（.xlsx）をアセットとして扱う
config.resolver.assetExts.push('xlsx');

module.exports = config;
