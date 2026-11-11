@extends('mcp.layout')

@section('title', 'Hozzáférés engedélyezése')

@section('content')
    <h1>{{ $client->name }} hozzáférést kér</h1>
    <p>Az alkalmazás a nevedben, a jogosultságaidon belül <strong>csak olvashatja</strong> az admin adatait. Módosítani, törölni vagy e-mailt küldeni nem tud.</p>

    <div class="account">
        <span>Belépve mint</span>
        {{ $user->name }} ({{ $user->email }})
    </div>

    <ul>
        <li>Körutazások, időpontok, árak, foglaltság és képek</li>
        <li>Foglalások, ügyfelek és apartmanok, ha ezekhez van jogod</li>
        <li>Az admin felhasználói kézikönyve képernyőképekkel</li>
    </ul>

    <p>Minden kérdést naplózunk. A hozzáférést a fiókod letiltása vagy az „AI asszisztens” jogosultság elvétele azonnal megszünteti.</p>

    <div class="actions">
        <form method="POST" action="{{ route('passport.authorizations.deny') }}">
            @csrf
            @method('DELETE')
            <input type="hidden" name="auth_token" value="{{ $authToken }}">
            <button type="submit" class="button button-secondary">Mégse</button>
        </form>

        <form method="POST" action="{{ route('passport.authorizations.approve') }}">
            @csrf
            <input type="hidden" name="auth_token" value="{{ $authToken }}">
            <button type="submit" class="button">Engedélyezem</button>
        </form>
    </div>
@endsection
