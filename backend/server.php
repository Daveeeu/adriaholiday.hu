<?php

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

if (
    $uri !== '/' &&
    file_exists($publicPath.$uri)
) {
    return false;
}

if (str_starts_with($uri, '/admin')) {
    $adminAssetPath = $publicPath.'/admin'.substr($uri, strlen('/admin'));

    if (
        str_starts_with($uri, '/admin/assets/')
        || str_starts_with($uri, '/admin/favicon')
        || str_starts_with($uri, '/admin/robots.txt')
        || str_starts_with($uri, '/admin/manifest')
    ) {
        if (file_exists($adminAssetPath)) {
            return false;
        }
    }

    if (file_exists($publicPath.'/admin/index.html')) {
        readfile($publicPath.'/admin/index.html');
        return true;
    }
}

require_once $publicPath.'/index.php';
