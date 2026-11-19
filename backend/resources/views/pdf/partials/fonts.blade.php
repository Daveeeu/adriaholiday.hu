{{-- Inter, the site's typeface, embedded in every PDF (OFL, resources/fonts/Inter-OFL.txt); it covers every Hungarian letter. --}}
@foreach ([['normal', 'normal', 'Regular'], ['bold', 'normal', 'Bold'], ['normal', 'italic', 'Italic'], ['bold', 'italic', 'BoldItalic']] as [$weight, $style, $file])
    @font-face { font-family: 'Inter'; font-weight: {{ $weight }}; font-style: {{ $style }}; src: url('{{ resource_path("fonts/Inter-{$file}.ttf") }}') format('truetype'); }
@endforeach
