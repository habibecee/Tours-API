# Veri Modellemesi:

* **Kullanıcılar - Yorumlar - Turlar - Lokasyonlar - Rezervasyonlar arası ilişkiler kurulmalı.** 

## Kullanıcılar > Yorumlar arası ilişki:
- Bir kullanıcı birden fazla tura yorum yapabilir,
- Bir yorum birden fazla kullanıcıya sahip olamaz. 
- - Bu sebeple; 
- - One To Many (1:M) > Refferance > Child Refferance (yorum içerisinde kullanıcı id'si tutularak) şeklinde kurulmalı. 

## Yorumlar > Turlar arası ilişki:
- Bir tura birden fazla yorum yapılabilir. 
- Bir yorum birden fazla tura sahip olamaz,
- - Bu sebeple; 
- - One To Many (1:M) > Refferance > Child Refferance (yorum içerisinde tur id'si tutularak) şeklinde kurulmalı.

## Turlar > Lokasyonlar arası ilişki:
- Bir tura birden fazla lokasyon eklenebilir. 
- Bir lokasyonda da birden fazla tur olabilir,
- - Bu sebeple; 
- - Many To Many (M:M) > Embedding şeklinde kurulmalı.

## Turlar > Kullanıcılar(Tur Rehberleri) arası ilişki:
- Bir tura birden fazla rehber atanabilir. 
- Bir rehber birden fazla tura atanabilir,
- - Bu sebeple; 
- - Many To Many (M:M) > Refferance > Parent Refferance (tur içerisinde kullanıcı id tutulur) şeklinde kurulmalı.

## Turlar > Rezervasyonlar arası ilişki:
- Bir tura birden fazla rezervasyon yapılabilir. 
- Bir rezervasyon birden fazla tura sahip olamaz,
- - Bu sebeple; 
- - One To Many (1:M) > Refferance > Child Refferance (rezervasyon içerisinde tur id'si tutularak) şeklinde kurulmalı.

## Rezevasyonlar > Kullanıcılar arası ilişki:
- Bir rezervasyon birden fazla kullanıcıya sahip olamaz,
- Bir kullanıcı birden fazla rezervasyona sahip olabilir,
- - Bu sebeple; 
- - One To Many (1:M) > Refferance > Child Refferance (rezervasyon içerisinde user id'si tutarak) şeklinde kurulmalı.
