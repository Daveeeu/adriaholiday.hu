@extends('mcp.layout')

@section('title', 'Belépés')

@section('content')
    <h1>Belépés az AI asszisztenshez</h1>
    <p>Lépj be az admin felületen használt e-mail címeddel és jelszavaddal, hogy a Claude, a ChatGPT vagy a Gemini kérdezhessen az adatokról.</p>

    @if ($errors->any())
        <div class="error" role="alert">{{ $errors->first() }}</div>
    @endif

    <form method="POST" action="{{ route('mcp.login.store') }}">
        @csrf
        <label for="email">E-mail cím</label>
        <input id="email" type="email" name="email" value="{{ old('email') }}" autocomplete="username" required autofocus>

        <label for="password">Jelszó</label>
        <input id="password" type="password" name="password" autocomplete="current-password" required>

        <button type="submit" class="button">Belépés</button>
    </form>
@endsection
