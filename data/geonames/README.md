# GeoNames city catalog source

The committed `cities15000.normalized.tsv` is the offline generator input. It
was extracted from the official `cities15000.zip` acquisition identified in
[provenance.json](provenance.json). The ZIP is not needed for normal generation.
Its acquired SHA-256 and the normalized input SHA-256 are recorded there.

The upstream [GeoNames dump readme](https://download.geonames.org/export/dump/readme.txt)
defines the 19-column UTF-8 tab-delimited source format and states that
`cities15000.zip` contains cities above 15,000 population or capitals.
Normalization retained columns 1, 2, 3, 8, 9, 15, and 18 (one-indexed):
geoname ID, name, ASCII name, feature code, country code, population, and
IANA time zone. It retained all 34,149 rows in source order. The normalization
command after extracting the named ZIP member is:

```sh
unzip -p cities15000.zip cities15000.txt > cities15000.txt
node scripts/normalize-geonames.mjs cities15000.txt data/geonames/cities15000.normalized.tsv
```

`curation.v1.json` contains explicit GeoNames IDs. The listed manual includes
retain Geneva (CH), Reykjavík (IS), Kyoto (JP), Wellington (NZ), and San
Francisco (US). Its empty exclusion list is intentional. All valid `PPLC`
records are mandatory; remaining entries follow the documented population
and country-cap rules in TASK-0004. Refreshing the upstream snapshot is a
separate, deliberate development-time action requiring new provenance and
review. Ordinary generation and verification use only committed local data.

GeoNames data is licensed under
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
See [ATTRIBUTION.txt](../../public/ATTRIBUTION.txt) for distributed credit.
