insert into midias (evento_id, tipo, url, poster, largura, altura, ordem, capa)
select '619d42b1-fc4b-4f6d-8df5-091463ee4430'::uuid, v.tipo, v.url, v.poster, v.largura, v.altura, v.ordem, v.capa
from (values
  ('video','/como-foi/v/hero.mp4','/como-foi/v/hero.webp',720,1280,0,true),
  ('video','/como-foi/v/clip1.mp4','/como-foi/v/clip1.webp',720,1280,101,false),
  ('video','/como-foi/v/clip2.mp4','/como-foi/v/clip2.webp',720,1280,102,false),
  ('video','/como-foi/v/clip3.mp4','/como-foi/v/clip3.webp',720,1280,103,false),
  ('video','/como-foi/v/clip4.mp4','/como-foi/v/clip4.webp',720,1280,104,false),
  ('video','/como-foi/v/clip5.mp4','/como-foi/v/clip5.webp',720,1280,105,false),
  ('video','/como-foi/v/clip6.mp4','/como-foi/v/clip6.webp',720,1280,106,false),
  ('video','/como-foi/v/clip7.mp4','/como-foi/v/clip7.webp',720,1280,107,false),
  ('foto','/como-foi/f/foto01.webp',null,900,1600,1,false),
  ('foto','/como-foi/f/foto02.webp',null,900,1600,2,false),
  ('foto','/como-foi/f/foto03.webp',null,900,1125,3,false),
  ('foto','/como-foi/f/foto04.webp',null,900,1600,4,false),
  ('foto','/como-foi/f/foto05.webp',null,900,1600,5,false),
  ('foto','/como-foi/f/foto06.webp',null,900,1125,6,false),
  ('foto','/como-foi/f/foto07.webp',null,900,1600,7,false),
  ('foto','/como-foi/f/foto08.webp',null,900,1600,8,false),
  ('foto','/como-foi/f/foto09.webp',null,900,1125,9,false),
  ('foto','/como-foi/f/foto10.webp',null,900,1600,10,false),
  ('foto','/como-foi/f/foto11.webp',null,900,1600,11,false),
  ('foto','/como-foi/f/foto12.webp',null,900,1125,12,false),
  ('foto','/como-foi/f/foto13.webp',null,900,1600,13,false),
  ('foto','/como-foi/f/foto14.webp',null,900,1600,14,false)
) as v(tipo,url,poster,largura,altura,ordem,capa)
where not exists (select 1 from midias where evento_id='619d42b1-fc4b-4f6d-8df5-091463ee4430'::uuid);