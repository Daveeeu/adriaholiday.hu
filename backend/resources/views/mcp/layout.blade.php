<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>@yield('title') – {{ $siteName }}</title>
    <link rel="icon" href="/favicon.ico">
    <style>
        :root {
            --background: #f1f5f9;
            --card: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e2e8f0;
            --primary: oklch(0.592 0.144 244.65);
            --primary-text: #ffffff;
            --danger-bg: #fef2f2;
            --danger-text: #b91c1c;
            color-scheme: light dark;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background: #020617;
                --card: #0f172a;
                --text: #f1f5f9;
                --muted: #94a3b8;
                --border: #1e293b;
                --primary: oklch(0.69 0.134 240.1);
                --danger-bg: #450a0a;
                --danger-text: #fecaca;
            }
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: var(--background);
            color: var(--text);
            font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }

        .card {
            width: 100%;
            max-width: 420px;
            padding: 28px;
            border: 1px solid var(--border);
            border-radius: 14px;
            background: var(--card);
            box-shadow: 0 10px 30px rgb(15 23 42 / 0.08);
        }

        .brand { margin: 0 0 4px; color: var(--primary); font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        h1 { margin: 0 0 8px; font-size: 22px; line-height: 1.3; }
        p { margin: 0 0 16px; color: var(--muted); }
        label { display: block; margin: 0 0 6px; font-weight: 600; }

        input[type="email"], input[type="password"] {
            width: 100%;
            margin: 0 0 16px;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: transparent;
            color: inherit;
            font: inherit;
        }

        input:focus-visible, button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

        .button {
            width: 100%;
            padding: 11px 16px;
            border: 1px solid var(--primary);
            border-radius: 8px;
            background: var(--primary);
            color: var(--primary-text);
            font: inherit;
            font-weight: 600;
            cursor: pointer;
        }

        .button-secondary { border-color: var(--border); background: transparent; color: inherit; }
        .actions { display: flex; gap: 12px; margin-top: 20px; }
        .actions form { flex: 1; }
        .error { margin: 0 0 16px; padding: 10px 12px; border-radius: 8px; background: var(--danger-bg); color: var(--danger-text); }
        .account { margin: 0 0 16px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; }
        .account span { display: block; color: var(--muted); font-size: 13px; }
        ul { margin: 0 0 16px; padding-left: 20px; color: var(--muted); }
        li { margin-bottom: 4px; }
    </style>
</head>
<body>
<main class="card">
    <p class="brand">{{ $siteName }} · AI asszisztens</p>
    @yield('content')
</main>
</body>
</html>
