import { NextResponse } from 'next/server';
import { BusStop, BusLocation } from '@/types/bus';

// Assuming the content of public/busStops.json is available here
const busStopsGeoJSON = [
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7584991418296,
                8.99911943987481
            ]
        },
        "properties": {
            "stop_id": "AB014T1S7",
            "stop_name": "TELE GERAG"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7438920668842,
                9.03438775836052
            ]
        },
        "properties": {
            "stop_id": "AB016T1S7",
            "stop_name": "HEBTE GEWRGIS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7436474798672,
                9.03418416442969
            ]
        },
        "properties": {
            "stop_id": "AB015T2S2",
            "stop_name": "HABTE GEWRGIS DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7337658645683,
                9.03426476051578
            ]
        },
        "properties": {
            "stop_id": "AB012T2S14",
            "stop_name": "KURTU HNTSA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7298453876939,
                9.0337139129277
            ]
        },
        "properties": {
            "stop_id": "AB018T1S14",
            "stop_name": "AUTOBES TERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7173854860523,
                9.03704642050264
            ]
        },
        "properties": {
            "stop_id": "AB018T1S11",
            "stop_name": "KOLFE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.715061115188,
                9.02454252872126
            ]
        },
        "properties": {
            "stop_id": "AB018T2S7",
            "stop_name": "MESERET  EDGET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7159316174925,
                9.02130467997692
            ]
        },
        "properties": {
            "stop_id": "AB018T1S8",
            "stop_name": "HOLAND"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7206338528125,
                9.01408913298478
            ]
        },
        "properties": {
            "stop_id": "AB018T1S5",
            "stop_name": "TOR HAILOCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7209171479506,
                9.01393852049421
            ]
        },
        "properties": {
            "stop_id": "AB018T1S6",
            "stop_name": "TOR HAILOCH ZORO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7089435718752,
                9.01944885750013
            ]
        },
        "properties": {
            "stop_id": "AB018T2S9",
            "stop_name": "KERANIYO DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7049769838418,
                9.01758061643447
            ]
        },
        "properties": {
            "stop_id": "AB018T1S3",
            "stop_name": "MEDHANBIALEM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6994931583512,
                9.01806394727912
            ]
        },
        "properties": {
            "stop_id": "AB018T2S11",
            "stop_name": "KOKEBE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6960287707999,
                9.01919421037935
            ]
        },
        "properties": {
            "stop_id": "AB018T1S1",
            "stop_name": "KERANIYO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.76927369484,
                9.02827
            ]
        },
        "properties": {
            "stop_id": "AB015T2S7",
            "stop_name": "BETE MENGIST"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7716427204666,
                9.02812575404625
            ]
        },
        "properties": {
            "stop_id": "AB015T1S7",
            "stop_name": "ABOARE GEBEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7747298802772,
                9.02726637358416
            ]
        },
        "properties": {
            "stop_id": "AB015T1S6",
            "stop_name": "ABOARE ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.777233686848,
                9.02335102420584
            ]
        },
        "properties": {
            "stop_id": "AB015T2S10",
            "stop_name": "YESETOCH ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7839308556313,
                9.0318686798807
            ]
        },
        "properties": {
            "stop_id": "AB010T2S12",
            "stop_name": "BELGIUM EMBASSY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7848977565404,
                9.03111699626263
            ]
        },
        "properties": {
            "stop_id": "AB010T1S8",
            "stop_name": "ENGILSH EMBASSY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7887324139129,
                9.02877300932813
            ]
        },
        "properties": {
            "stop_id": "AB010T1S9",
            "stop_name": "ABOLE SUK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7952916698267,
                9.02506821602058
            ]
        },
        "properties": {
            "stop_id": "AB010T2S10",
            "stop_name": "SHOLA GEBEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8273123124746,
                9.02604422761157
            ]
        },
        "properties": {
            "stop_id": "AB010T2S4",
            "stop_name": "COOL HINTSA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8299247646919,
                9.02697145955269
            ]
        },
        "properties": {
            "stop_id": "AB010T1S16",
            "stop_name": "AHMED BUILDING"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8307560661546,
                9.02745172855318
            ]
        },
        "properties": {
            "stop_id": "AB010T2S3",
            "stop_name": "NOC CHAF"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8448198067765,
                9.03319077955228
            ]
        },
        "properties": {
            "stop_id": "AB010T1S18",
            "stop_name": "ST. MARIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8467015911633,
                9.03419788473856
            ]
        },
        "properties": {
            "stop_id": "AB010T2S1",
            "stop_name": "KOTEBE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8539126868618,
                9.02069265983161
            ]
        },
        "properties": {
            "stop_id": "AB0106T1S5",
            "stop_name": "CIVIL SERVIC"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8603569966981,
                9.02070312892574
            ]
        },
        "properties": {
            "stop_id": "AB0106T2S7",
            "stop_name": "MERE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8608687568193,
                9.02051362323725
            ]
        },
        "properties": {
            "stop_id": "AB0106T1S6",
            "stop_name": "ST .MECAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8725941236176,
                9.02112338647872
            ]
        },
        "properties": {
            "stop_id": "AB0106T1S7",
            "stop_name": "CMC"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8902659914842,
                8.9733110233871
            ]
        },
        "properties": {
            "stop_id": "AB0106T1S8",
            "stop_name": "CMC SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8767600211758,
                9.00234832232533
            ]
        },
        "properties": {
            "stop_id": "AB0106T2S4",
            "stop_name": "BOLE ARABSA (4)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8852470830086,
                8.99657346258923
            ]
        },
        "properties": {
            "stop_id": "AB0106T1S11",
            "stop_name": "AYAT ADEBABAY HULET(2)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8855314475722,
                8.99632935046202
            ]
        },
        "properties": {
            "stop_id": "AB0106T2S3",
            "stop_name": "BOLE ARABSA(3)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8851154925685,
                8.98416116488519
            ]
        },
        "properties": {
            "stop_id": "AB0106T2S2",
            "stop_name": "BOLE ARABSA (2)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8849371051102,
                8.96542856771642
            ]
        },
        "properties": {
            "stop_id": "AB0106T1S15",
            "stop_name": "ST.GEBEREAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8892595541822,
                8.97405260876757
            ]
        },
        "properties": {
            "stop_id": "AB0106T2S1",
            "stop_name": "BOLE ARABSA(1)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7157784625619,
                8.99265515354933
            ]
        },
        "properties": {
            "stop_id": "AB003T1S2",
            "stop_name": "3 KUTIR MAZORIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7177779919029,
                8.99435808441446
            ]
        },
        "properties": {
            "stop_id": "AB003T2S12",
            "stop_name": "AYERTENA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7206153012042,
                9.00987774052044
            ]
        },
        "properties": {
            "stop_id": "AB003T1S4",
            "stop_name": "TORHAYILOCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.721681401163,
                9.01192919139767
            ]
        },
        "properties": {
            "stop_id": "AB003T2S9",
            "stop_name": "AGUST"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7265404985425,
                9.01128978833732
            ]
        },
        "properties": {
            "stop_id": "AB003T1S5",
            "stop_name": "MLKONANOCH CLUB"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7290424767922,
                9.01196106907174
            ]
        },
        "properties": {
            "stop_id": "AB003T1S6",
            "stop_name": "COCA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7065446272566,
                9.05823582003974
            ]
        },
        "properties": {
            "stop_id": "AB019T1S12",
            "stop_name": "GULELE FANA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7334310551502,
                9.01159358071255
            ]
        },
        "properties": {
            "stop_id": "AB003T1S7",
            "stop_name": "HIGHCOURT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7348128833198,
                9.01578483265906
            ]
        },
        "properties": {
            "stop_id": "AB004T1S21",
            "stop_name": "DARMAR"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7116452393352,
                9.05760389628584
            ]
        },
        "properties": {
            "stop_id": "AB019T1S11",
            "stop_name": "AWOLIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7149855769146,
                9.05436858391687
            ]
        },
        "properties": {
            "stop_id": "AB019T1S10",
            "stop_name": "WINGET CHAF"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7202229177557,
                9.05288354112288
            ]
        },
        "properties": {
            "stop_id": "AB019T2S9",
            "stop_name": "FILANS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7220616173617,
                9.05137919131972
            ]
        },
        "properties": {
            "stop_id": "AB019T2S10",
            "stop_name": "MEDHANIALEM (TOTAL)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7220331182496,
                9.05155107528768
            ]
        },
        "properties": {
            "stop_id": "AB019T1S8",
            "stop_name": "MEDHANIALEM SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7286279,
                9.0467098
            ]
        },
        "properties": {
            "stop_id": "AB019T1S7",
            "stop_name": "SAINT PAWLOS HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7524096505933,
                9.03639879204725
            ]
        },
        "properties": {
            "stop_id": "AB006T2S11",
            "stop_name": "ST.GIYOORGISI CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7512370169731,
                9.0320019043352
            ]
        },
        "properties": {
            "stop_id": "AB003T1S15",
            "stop_name": "BANK DUROMA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6853260374116,
                9.03537930839331
            ]
        },
        "properties": {
            "stop_id": "AB021T1S1",
            "stop_name": "FILI DORO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6888925606896,
                9.0340620362596
            ]
        },
        "properties": {
            "stop_id": "AB021T2S9",
            "stop_name": "POLICE TABIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6953643096684,
                9.0328995826845
            ]
        },
        "properties": {
            "stop_id": "AB021T1S3",
            "stop_name": "REALSTATE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7045386760904,
                9.03400816540039
            ]
        },
        "properties": {
            "stop_id": "AB021T2S7",
            "stop_name": "COMPRENSIVE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7134129780045,
                9.03356449842898
            ]
        },
        "properties": {
            "stop_id": "AB021T2S5",
            "stop_name": "18"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7937772930492,
                8.99009216578808
            ]
        },
        "properties": {
            "stop_id": "AB009T2S1",
            "stop_name": "BRAS CLINIC"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7377797937413,
                9.01123138811506
            ]
        },
        "properties": {
            "stop_id": "AB021T1S7",
            "stop_name": "DELDEY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7797584392755,
                9.00427207393814
            ]
        },
        "properties": {
            "stop_id": "AB009T2S3",
            "stop_name": "LIYAN CITY HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7572663032484,
                9.01771268826815
            ]
        },
        "properties": {
            "stop_id": "AB022T1S2",
            "stop_name": "FELWEHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7771737893391,
                9.02344
            ]
        },
        "properties": {
            "stop_id": "AB022T1S4",
            "stop_name": "WOMEN SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7961408217395,
                9.02441471904825
            ]
        },
        "properties": {
            "stop_id": "AB022T1S7",
            "stop_name": "YEKA MICHAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8268655973809,
                9.02037215284225
            ]
        },
        "properties": {
            "stop_id": "AB022T2S9",
            "stop_name": "MANAGEMENT INSTITUTE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7675768469636,
                9.01990655294544
            ]
        },
        "properties": {
            "stop_id": "AB009T2S6",
            "stop_name": "ST.GEBREL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8518375421583,
                9.02044245784258
            ]
        },
        "properties": {
            "stop_id": "AB022T1S13",
            "stop_name": "TIKUR ABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7568279167629,
                9.03893791640616
            ]
        },
        "properties": {
            "stop_id": "AB009T2S10",
            "stop_name": "SEBA DERGA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8521940201736,
                9.01028939482201
            ]
        },
        "properties": {
            "stop_id": "AB022T2S4",
            "stop_name": "SAFARIE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7638263069246,
                8.91133829432101
            ]
        },
        "properties": {
            "stop_id": "AB004T1S4",
            "stop_name": "MAREMIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8513198260137,
                8.99552139190825
            ]
        },
        "properties": {
            "stop_id": "AB022T1S15",
            "stop_name": "SAINT GEORGIS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7663022072891,
                8.94507626381614
            ]
        },
        "properties": {
            "stop_id": "AB004T1S8",
            "stop_name": "ABO JUNCTION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7961695110393,
                8.85976228625611
            ]
        },
        "properties": {
            "stop_id": "AB025T2S1",
            "stop_name": "AKAKI KORKORO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7926781268171,
                8.86347950137457
            ]
        },
        "properties": {
            "stop_id": "AB025T1S23",
            "stop_name": "02 KEBELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7887407830304,
                8.87388182477756
            ]
        },
        "properties": {
            "stop_id": "AB025T2S4",
            "stop_name": "AKAKI BERETABERET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7608807798172,
                8.97218175257371
            ]
        },
        "properties": {
            "stop_id": "AB004T2S11",
            "stop_name": "MAMO POLY NEFSILK TECHNIC"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7866052090545,
                8.87688522826638
            ]
        },
        "properties": {
            "stop_id": "AB025T1S20",
            "stop_name": "MESHULEKIYA AKAKI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7856036408764,
                8.88443693017111
            ]
        },
        "properties": {
            "stop_id": "AB025T1S19",
            "stop_name": "08 ADARASH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7599031588682,
                8.97594850825539
            ]
        },
        "properties": {
            "stop_id": "AB004T2S10",
            "stop_name": "GOTERA SHELL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7818933517437,
                8.88693987065358
            ]
        },
        "properties": {
            "stop_id": "AB025T2S6",
            "stop_name": "DERARTU"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7768287431949,
                8.8910829889683
            ]
        },
        "properties": {
            "stop_id": "AB025T1S17",
            "stop_name": "GOJO HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7560864955097,
                8.98228303639139
            ]
        },
        "properties": {
            "stop_id": "AB004T2S9",
            "stop_name": "MEHA PEPSI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7478449415781,
                8.99393174987708
            ]
        },
        "properties": {
            "stop_id": "AB004T2S6",
            "stop_name": "BULGARIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7633962662959,
                8.91231253437399
            ]
        },
        "properties": {
            "stop_id": "AB025T1S13",
            "stop_name": "SAINT GEBRAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7469007422866,
                9.00349753781084
            ]
        },
        "properties": {
            "stop_id": "AB006T2S3",
            "stop_name": "GENET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7681708113141,
                8.92981952365487
            ]
        },
        "properties": {
            "stop_id": "AB025T1S10",
            "stop_name": "WEHALEMAT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7467667808373,
                9.01193056683975
            ]
        },
        "properties": {
            "stop_id": "AB003T1S10",
            "stop_name": "WABI SHABLE HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7631371413786,
                8.93808610565643
            ]
        },
        "properties": {
            "stop_id": "AB025T2S13",
            "stop_name": "GUMRUCK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7475165528213,
                8.99717050723687
            ]
        },
        "properties": {
            "stop_id": "AB006T1S12",
            "stop_name": "BEGTERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7432126526538,
                9.01054996107108
            ]
        },
        "properties": {
            "stop_id": "AB004T1S19",
            "stop_name": "TEGBARRIED"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7431706507726,
                9.01032635069917
            ]
        },
        "properties": {
            "stop_id": "AB003T1S9",
            "stop_name": "TEGBARIED"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.879020440504,
                9.05660761127207
            ]
        },
        "properties": {
            "stop_id": "AB007T1S7",
            "stop_name": "TAFO JUNCTION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8778804254676,
                9.05706005665796
            ]
        },
        "properties": {
            "stop_id": "AB007T2S18",
            "stop_name": "TAFO ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.854695518193,
                9.03602327770805
            ]
        },
        "properties": {
            "stop_id": "AB001T1S9",
            "stop_name": "KERA CONDMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.860594909088,
                9.03795826803001
            ]
        },
        "properties": {
            "stop_id": "AB001T1S10",
            "stop_name": "KERA SAYIDERS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7572474721836,
                9.07772562605264
            ]
        },
        "properties": {
            "stop_id": "AB017T1S1",
            "stop_name": "KUSKOAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7590433218285,
                9.07452788955318
            ]
        },
        "properties": {
            "stop_id": "AB017T1S2",
            "stop_name": "SANBA NEKRSA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7607169136764,
                9.06921625411861
            ]
        },
        "properties": {
            "stop_id": "AB017T1S4",
            "stop_name": "SELASIE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.76127,
                9.06263822302803
            ]
        },
        "properties": {
            "stop_id": "AB016T1S1",
            "stop_name": "SHEROMEDA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7622309495225,
                9.05232513500241
            ]
        },
        "properties": {
            "stop_id": "AB017T1S6",
            "stop_name": "MESKYAZUNA MEDEHNALEM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7722192165943,
                9.05354140376264
            ]
        },
        "properties": {
            "stop_id": "AB012T1S8",
            "stop_name": "MEZAN"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7839224,
                9.0608546
            ]
        },
        "properties": {
            "stop_id": "AB012T1S12",
            "stop_name": "TENA TABEA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7522932331115,
                9.03544756397126
            ]
        },
        "properties": {
            "stop_id": "AB014T1S1",
            "stop_name": "ST.YOSAFE SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7527559814286,
                9.0386169512501
            ]
        },
        "properties": {
            "stop_id": "AB012T1S3",
            "stop_name": "ST.GEWERGIS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7579258383398,
                9.03637609459305
            ]
        },
        "properties": {
            "stop_id": "AB010T2S18",
            "stop_name": "ST.MARIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7516650727106,
                9.02626300378432
            ]
        },
        "properties": {
            "stop_id": "AB014T1S2",
            "stop_name": "TEWODROS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7521768495523,
                9.02174780537188
            ]
        },
        "properties": {
            "stop_id": "AB014T2S11",
            "stop_name": "TKUR ANBESA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7590843442997,
                9.01052877072064
            ]
        },
        "properties": {
            "stop_id": "AB014T1S5",
            "stop_name": "YOSEF SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7592132001542,
                9.01006232117154
            ]
        },
        "properties": {
            "stop_id": "AB014T2S9",
            "stop_name": "ST.YOSEF SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.732616422485,
                8.95558560576116
            ]
        },
        "properties": {
            "stop_id": "AB117T1S4",
            "stop_name": "GEBRIAEL DILDY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7395496,
                8.9989008
            ]
        },
        "properties": {
            "stop_id": "AB117T1S12",
            "stop_name": "AFRICAN UNION SQUARE / MIKAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7483041879047,
                9.04469977372055
            ]
        },
        "properties": {
            "stop_id": "AB111T1S3",
            "stop_name": "YOHANES"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.74122,
                9.00284
            ]
        },
        "properties": {
            "stop_id": "AB117T1S13",
            "stop_name": "CIGAR FACTORY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7443315068187,
                9.05124432590464
            ]
        },
        "properties": {
            "stop_id": "AB111T1S5",
            "stop_name": "INKULAL FABRICA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.720863675828,
                8.96738447849808
            ]
        },
        "properties": {
            "stop_id": "AB121T1S9",
            "stop_name": "MIKAEL SQUALRE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7198642578243,
                9.05307822837041
            ]
        },
        "properties": {
            "stop_id": "AB111T1S9",
            "stop_name": "FINANCE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7394578,
                8.9990598
            ]
        },
        "properties": {
            "stop_id": "AB117T2S3",
            "stop_name": "AFRICAN UNION SQUARE/MIKAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7152602711465,
                8.96148206016009
            ]
        },
        "properties": {
            "stop_id": "AB121T1S11",
            "stop_name": "JEMO YETEBABERUT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7084807914325,
                8.95949265349808
            ]
        },
        "properties": {
            "stop_id": "AB121T1S13",
            "stop_name": "MESTAWET FABRICA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6992817921608,
                8.95639125451271
            ]
        },
        "properties": {
            "stop_id": "AB121T1S14",
            "stop_name": "JEMO KUTUR 3"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7313152448362,
                8.96839490533751
            ]
        },
        "properties": {
            "stop_id": "AB117T2S9",
            "stop_name": "MEKENISA GEBEYOCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7327428310452,
                8.9657012054961
            ]
        },
        "properties": {
            "stop_id": "AB117T2S10",
            "stop_name": "GERMAN SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.71201,
                8.9603
            ]
        },
        "properties": {
            "stop_id": "AB121T2SS4",
            "stop_name": "JEMO KUTUR 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7325319513089,
                8.95566844114592
            ]
        },
        "properties": {
            "stop_id": "AB117T2S11",
            "stop_name": "GEBRIAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7340522528684,
                8.9469750296637
            ]
        },
        "properties": {
            "stop_id": "AB117T2S12",
            "stop_name": "MEBRATE HAILE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7208102534008,
                8.96683913968838
            ]
        },
        "properties": {
            "stop_id": "AB121T2S7",
            "stop_name": "MIKAEL SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7598013825864,
                8.97637336134396
            ]
        },
        "properties": {
            "stop_id": "AB104T1S3",
            "stop_name": "GOTERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7633489210274,
                8.95272307740368
            ]
        },
        "properties": {
            "stop_id": "AB104T1S7",
            "stop_name": "SARIS NIGD BANK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7750993343448,
                8.93317274847967
            ]
        },
        "properties": {
            "stop_id": "AB104T1S9",
            "stop_name": "WERKU SEFER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6742786805655,
                9.02199056329918
            ]
        },
        "properties": {
            "stop_id": "AB105T1S1",
            "stop_name": "ANFO MEDA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6787425357413,
                9.02101055643806
            ]
        },
        "properties": {
            "stop_id": "AB105T1S2",
            "stop_name": "ANFO ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6884510636267,
                9.02315732625747
            ]
        },
        "properties": {
            "stop_id": "AB105T1S3",
            "stop_name": "MARIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6957731577269,
                9.01907947376106
            ]
        },
        "properties": {
            "stop_id": "AB105T1S4",
            "stop_name": "YESHI DEBELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6999462420149,
                9.01775942874935
            ]
        },
        "properties": {
            "stop_id": "AB105T1S5",
            "stop_name": "KERANIO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.710143515253,
                9.0133662065287
            ]
        },
        "properties": {
            "stop_id": "AB105T1S7",
            "stop_name": "KERANIO MEWCHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7220214342507,
                9.0115819043833
            ]
        },
        "properties": {
            "stop_id": "AB105T1S8",
            "stop_name": "TORHAILOCH ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.726499251615,
                9.01125815581192
            ]
        },
        "properties": {
            "stop_id": "AB105T1S9",
            "stop_name": "MEKONINOCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7292371484842,
                9.01194839405813
            ]
        },
        "properties": {
            "stop_id": "AB105T1S10",
            "stop_name": "COCA CAF"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7335297999174,
                9.01158420466071
            ]
        },
        "properties": {
            "stop_id": "AB105T1S11",
            "stop_name": "FIRDBET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7426343385586,
                9.01044830014818
            ]
        },
        "properties": {
            "stop_id": "AB105T1S13",
            "stop_name": "TEGBARE ED"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7495870250948,
                9.01385518845472
            ]
        },
        "properties": {
            "stop_id": "AB105T1S15",
            "stop_name": "COMERCE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7667220640147,
                8.93238669758526
            ]
        },
        "properties": {
            "stop_id": "AB109T1S2",
            "stop_name": "KALITY MASELTEGNA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7633386155028,
                8.91246987662162
            ]
        },
        "properties": {
            "stop_id": "AB109T1S5",
            "stop_name": "KALITY GEBRIEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7667504673264,
                8.902923956376
            ]
        },
        "properties": {
            "stop_id": "AB109T1S6",
            "stop_name": "CHERALIA FABRICA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7704288017764,
                8.89721586241435
            ]
        },
        "properties": {
            "stop_id": "AB109T1S7",
            "stop_name": "KALITY MENEHARIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7771700265078,
                8.88320996028743
            ]
        },
        "properties": {
            "stop_id": "AB109T1S9",
            "stop_name": "SELAM HINTSA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.793224214653,
                8.87600526178321
            ]
        },
        "properties": {
            "stop_id": "AB109T1S13",
            "stop_name": "GOMISTA (DELDEY)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7984348095366,
                8.86751501681899
            ]
        },
        "properties": {
            "stop_id": "AB109T1S14",
            "stop_name": "ALEM BANK (BELAY AB MOTORS TESHAGRO)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8051774661841,
                8.86890690635995
            ]
        },
        "properties": {
            "stop_id": "AB109T1S15",
            "stop_name": "TULUDIMTU (INFRONT OF TAF GAS STATION)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8140248494159,
                8.87223142555974
            ]
        },
        "properties": {
            "stop_id": "AB109T1S17",
            "stop_name": "SELAM SEFER (TAPELA GAR)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8205224509182,
                8.87465126482227
            ]
        },
        "properties": {
            "stop_id": "AB109T1S18",
            "stop_name": "TULUDIMTU ADEBABY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8148855695027,
                8.85922551631347
            ]
        },
        "properties": {
            "stop_id": "AB110T1S1",
            "stop_name": "MAHIBER BETOCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8218396394682,
                8.86585932671187
            ]
        },
        "properties": {
            "stop_id": "AB110T1S2",
            "stop_name": "PROJECT 12 AKABABI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8207017703704,
                8.870906477739
            ]
        },
        "properties": {
            "stop_id": "AB110T1S3",
            "stop_name": "G7"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8196271319687,
                8.8756101587013
            ]
        },
        "properties": {
            "stop_id": "AB110T1S4",
            "stop_name": "TULUDIMTUADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8136638796766,
                8.87226161409057
            ]
        },
        "properties": {
            "stop_id": "AB110T1S5",
            "stop_name": "ARSEMA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7631299677241,
                8.93809458360968
            ]
        },
        "properties": {
            "stop_id": "AB110T1S18",
            "stop_name": "BABUR TABIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7599712933595,
                8.97635627316083
            ]
        },
        "properties": {
            "stop_id": "AB110T1S23",
            "stop_name": "GOTERA DEPO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7598117973562,
                8.99418581160743
            ]
        },
        "properties": {
            "stop_id": "AB110T1S25",
            "stop_name": "TEMEJA YAZ (BEKLO BET)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7592333368628,
                9.01022956806085
            ]
        },
        "properties": {
            "stop_id": "AB110T1S28",
            "stop_name": "ABIOT ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7638713028119,
                9.01976775155688
            ]
        },
        "properties": {
            "stop_id": "AB110T1S30",
            "stop_name": "KIRAY BETOCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7615617864526,
                9.04271309587086
            ]
        },
        "properties": {
            "stop_id": "AB110T1S34",
            "stop_name": "ANBESA GIBI (PEPSI)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7621996955676,
                9.05130069512508
            ]
        },
        "properties": {
            "stop_id": "AB110T1S36",
            "stop_name": "MEKSAYE HIZUNAN MEDHANIALEM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.762545883027,
                9.05403632741946
            ]
        },
        "properties": {
            "stop_id": "AB110T1S37",
            "stop_name": "ASEMBLE YESEBSEBA ADARASH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7070721378659,
                8.95906496232154
            ]
        },
        "properties": {
            "stop_id": "AB067T2S19",
            "stop_name": "JEMMO 3"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7129239342962,
                8.96070019553398
            ]
        },
        "properties": {
            "stop_id": "AB067T2S18",
            "stop_name": "JEMMO 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.715146100741,
                8.96137807669617
            ]
        },
        "properties": {
            "stop_id": "AB067T2S17",
            "stop_name": "ANDEGNA BER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7275346786709,
                8.96554701803345
            ]
        },
        "properties": {
            "stop_id": "AB067T2S14",
            "stop_name": "MIKAEL DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7340130019008,
                8.97859986873666
            ]
        },
        "properties": {
            "stop_id": "AB067T210",
            "stop_name": "ABO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7479400176313,
                9.01058030102655
            ]
        },
        "properties": {
            "stop_id": "AB068T1S7",
            "stop_name": "BUNA ENA SHAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7638802493325,
                9.01924808965746
            ]
        },
        "properties": {
            "stop_id": "AB068T1S10",
            "stop_name": "HILTONE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7625733649245,
                9.03859958104403
            ]
        },
        "properties": {
            "stop_id": "AB068T1S13",
            "stop_name": "5KILO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7719500358839,
                9.03884647044441
            ]
        },
        "properties": {
            "stop_id": "AB068T1S16",
            "stop_name": "MINILIK SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7791325014068,
                9.05794493077206
            ]
        },
        "properties": {
            "stop_id": "AB055T2S3",
            "stop_name": "BONO WEHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7293105383805,
                9.01212834148055
            ]
        },
        "properties": {
            "stop_id": "AB068T2S15",
            "stop_name": "HINTSA COLLEGE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7836222865158,
                9.0607528231968
            ]
        },
        "properties": {
            "stop_id": "AB055T1S13",
            "stop_name": "YEHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7880264545155,
                9.06226811997068
            ]
        },
        "properties": {
            "stop_id": "AB055T2S1",
            "stop_name": "GURARA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7431699399585,
                9.01054872108158
            ]
        },
        "properties": {
            "stop_id": "AB068T1S12",
            "stop_name": "TEGEBARED"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7619509633895,
                9.04082947446083
            ]
        },
        "properties": {
            "stop_id": "AB055T2S8",
            "stop_name": "ANBESSA GIBI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7633551631476,
                9.03193204735334
            ]
        },
        "properties": {
            "stop_id": "AB068T2S6",
            "stop_name": "MINISTRY OF EDUCATION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7135097448998,
                9.03358393732879
            ]
        },
        "properties": {
            "stop_id": "AB069T1S7",
            "stop_name": "NOCK/18 MAZORIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7151599962337,
                9.03380598624601
            ]
        },
        "properties": {
            "stop_id": "AB069T1S6",
            "stop_name": "DEGU HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7164574514121,
                9.03734227750861
            ]
        },
        "properties": {
            "stop_id": "AB069T1S5",
            "stop_name": "CONFE DEAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7294456874929,
                9.03377875542478
            ]
        },
        "properties": {
            "stop_id": "AB069T1S2A",
            "stop_name": "DARSEMA GROSERY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7102525883148,
                9.04086127492
            ]
        },
        "properties": {
            "stop_id": "AB068T2S2",
            "stop_name": "MILINUM SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7052418208412,
                9.04238455411731
            ]
        },
        "properties": {
            "stop_id": "AB069T2S1",
            "stop_name": "PHILIPHES/LOME MEDA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7811617278251,
                9.05985007707933
            ]
        },
        "properties": {
            "stop_id": "AB064T1S17",
            "stop_name": "BIRET DILDIY (BONO WUHA)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.769092858646,
                9.04700509168935
            ]
        },
        "properties": {
            "stop_id": "AB064T1S13",
            "stop_name": "3GNA SHALEKA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7615847236812,
                9.04263265026805
            ]
        },
        "properties": {
            "stop_id": "AB064T1S11",
            "stop_name": "6KILO (FEDERAL COURT)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7728384073325,
                9.03249190908601
            ]
        },
        "properties": {
            "stop_id": "AB064T1S7",
            "stop_name": "BELA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7838062692891,
                9.03200968615928
            ]
        },
        "properties": {
            "stop_id": "AB064T1S4",
            "stop_name": "BELJIUM EMBASSY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7887707556477,
                9.02870947942162
            ]
        },
        "properties": {
            "stop_id": "AB064T2S14",
            "stop_name": "BRITISH EMBASSY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7799697782992,
                9.03445367149439
            ]
        },
        "properties": {
            "stop_id": "AB064T2S12",
            "stop_name": "KOKEBE TSEBAH SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7651986349005,
                9.03208855358455
            ]
        },
        "properties": {
            "stop_id": "AB064T2S9",
            "stop_name": "4KILLO(SELASSIE)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7636458604919,
                9.04411710143158
            ]
        },
        "properties": {
            "stop_id": "AB064T2S6",
            "stop_name": "6KIL0"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7191124,
                8.9998644
            ]
        },
        "properties": {
            "stop_id": "AB070S5",
            "stop_name": "OLD AIRPORT / MOBIL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.781060709522,
                9.06000235542597
            ]
        },
        "properties": {
            "stop_id": "AB064T2S2",
            "stop_name": "BRET DILDY (BUNO WEHA)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7333732114543,
                9.01159975073253
            ]
        },
        "properties": {
            "stop_id": "AB070T2S10",
            "stop_name": "LIDETA FIRD BET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7386039520254,
                9.01094119860461
            ]
        },
        "properties": {
            "stop_id": "AB070T2S11",
            "stop_name": "LIDETA CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7495424079465,
                9.01382417179542
            ]
        },
        "properties": {
            "stop_id": "AB070T2S14",
            "stop_name": "COMMERCE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7516127125544,
                9.01591571343512
            ]
        },
        "properties": {
            "stop_id": "AB070T2S15",
            "stop_name": "BHERAWI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7571539749737,
                9.01757716810382
            ]
        },
        "properties": {
            "stop_id": "AB070T2S16",
            "stop_name": "FILWUHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7669216025507,
                9.01670123226433
            ]
        },
        "properties": {
            "stop_id": "AB070T2S17",
            "stop_name": "6TH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7706384972932,
                9.01943196516658
            ]
        },
        "properties": {
            "stop_id": "AB070T2S19",
            "stop_name": "AZMARI BET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7765642925154,
                9.02443283208847
            ]
        },
        "properties": {
            "stop_id": "AB070T2S20",
            "stop_name": "AWARE DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8148748938068,
                9.00363899880215
            ]
        },
        "properties": {
            "stop_id": "AB071T1S20",
            "stop_name": "GERJI MEBRAT HAILE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8005523167509,
                9.00989363330393
            ]
        },
        "properties": {
            "stop_id": "AB071T1S17",
            "stop_name": "24"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8000097412228,
                9.02033039623807
            ]
        },
        "properties": {
            "stop_id": "AB071T2S5",
            "stop_name": "MEGENAGNA / ZEFMESH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7869267867686,
                9.02207986734569
            ]
        },
        "properties": {
            "stop_id": "AB071T1S13",
            "stop_name": "DINBERWA HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7715329195129,
                9.02065905254721
            ]
        },
        "properties": {
            "stop_id": "AB071T2S10",
            "stop_name": "KAZANCHIS / MELES FOUNDATION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7385585963823,
                9.01111115554005
            ]
        },
        "properties": {
            "stop_id": "AB071T2S17",
            "stop_name": "LIDETA CHURCH / BALCHA HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7441992241009,
                9.02760974025632
            ]
        },
        "properties": {
            "stop_id": "AB074T1S2",
            "stop_name": "TEKLEHAYMANOT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.748896668377,
                9.02107904369545
            ]
        },
        "properties": {
            "stop_id": "AB074T1S3",
            "stop_name": "TIKUR ANBESSA HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7576057525501,
                9.01383304993317
            ]
        },
        "properties": {
            "stop_id": "AB074T1S5",
            "stop_name": "GHION HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.76171,
                9.04377
            ]
        },
        "properties": {
            "stop_id": "AB074T2S14",
            "stop_name": "YEKATIT 12 HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6894734956594,
                8.98129187271738
            ]
        },
        "properties": {
            "stop_id": "AB066T1S12",
            "stop_name": "GIRAR"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7078199680249,
                8.98660506975566
            ]
        },
        "properties": {
            "stop_id": "AB066T1S9",
            "stop_name": "ZENEBEWORK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7295230248478,
                9.01589176799775
            ]
        },
        "properties": {
            "stop_id": "AB066T1S3",
            "stop_name": "COCACOLA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.729299967026,
                9.01194298797118
            ]
        },
        "properties": {
            "stop_id": "AB066T2S6",
            "stop_name": "COCA COLA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7345500054546,
                9.01329001774769
            ]
        },
        "properties": {
            "stop_id": "AB066T2S7",
            "stop_name": "LIDETA CONDOMINIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6985278796696,
                8.95563435666888
            ]
        },
        "properties": {
            "stop_id": "AB067T1S1",
            "stop_name": "JEMO 3"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7059697537772,
                8.95855542383368
            ]
        },
        "properties": {
            "stop_id": "AB067T1S2",
            "stop_name": "JEMO 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.739642996254,
                8.99909537019187
            ]
        },
        "properties": {
            "stop_id": "AB067T1S13",
            "stop_name": "SARBET ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.741425086599,
                9.0031406898742
            ]
        },
        "properties": {
            "stop_id": "AB067T1S14",
            "stop_name": "AFRICA UNION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7495040300557,
                9.01389035558281
            ]
        },
        "properties": {
            "stop_id": "AB067T1S17",
            "stop_name": "SENGA TERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7425161779285,
                9.05373760440618
            ]
        },
        "properties": {
            "stop_id": "AB045T2S3",
            "stop_name": "SEMEN MAZAGAJA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7456381,
                9.0491538
            ]
        },
        "properties": {
            "stop_id": "AB045T2S4",
            "stop_name": "KELMWERK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7459953782189,
                9.04881396389385
            ]
        },
        "properties": {
            "stop_id": "AB045T1S10",
            "stop_name": "KELEMWERK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7593178842891,
                9.04371731378351
            ]
        },
        "properties": {
            "stop_id": "AB038T1S21",
            "stop_name": "YEATIT 12 HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7690353590226,
                9.04712688895229
            ]
        },
        "properties": {
            "stop_id": "AB041T1S3",
            "stop_name": "JAN MEDA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7568670031077,
                9.03877633793746
            ]
        },
        "properties": {
            "stop_id": "AB039T2S9",
            "stop_name": "SEBA DEREJA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7715070986826,
                9.06498142762893
            ]
        },
        "properties": {
            "stop_id": "AB041T2S10",
            "stop_name": "EYESUS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7680961330742,
                9.05855177440412
            ]
        },
        "properties": {
            "stop_id": "AB041T2S9",
            "stop_name": "HAMLE 19"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7205861170298,
                9.0643783514589
            ]
        },
        "properties": {
            "stop_id": "AB047T1S1",
            "stop_name": "SHEGOLE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7200352113559,
                9.05410394322615
            ]
        },
        "properties": {
            "stop_id": "AB047T2S8",
            "stop_name": "SHEGOLE BANK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7221638498536,
                9.05147994674682
            ]
        },
        "properties": {
            "stop_id": "AB047T1S3",
            "stop_name": "FINAS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.749128,
                9.03525
            ]
        },
        "properties": {
            "stop_id": "AB041T1S10",
            "stop_name": "HABTEGIORGIS DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7505966073587,
                9.03281653282291
            ]
        },
        "properties": {
            "stop_id": "AB039T2S10",
            "stop_name": "ARADA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7517801492347,
                9.02634745171414
            ]
        },
        "properties": {
            "stop_id": "AB045T2S8",
            "stop_name": "TEDROS SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7468356910151,
                9.01197926959198
            ]
        },
        "properties": {
            "stop_id": "AB038T1S12",
            "stop_name": "AWASH BANK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7477902793424,
                8.99524757912602
            ]
        },
        "properties": {
            "stop_id": "AB038T1S9",
            "stop_name": "HOTEL AND TOURISM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7452570634005,
                8.97537588779843
            ]
        },
        "properties": {
            "stop_id": "AB038T1S5",
            "stop_name": "GFK BUILDING"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7417089447338,
                8.97139910794224
            ]
        },
        "properties": {
            "stop_id": "AB038T1S4",
            "stop_name": "GOFA CAMP"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8946257565806,
                9.01138834085528
            ]
        },
        "properties": {
            "stop_id": "AB049T2S1",
            "stop_name": "AYAT CHEFE CONDOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8946012319517,
                9.01707051922229
            ]
        },
        "properties": {
            "stop_id": "AB049T2S4",
            "stop_name": "POLICE TABIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8912088729424,
                9.02225378182741
            ]
        },
        "properties": {
            "stop_id": "AB049T2S6",
            "stop_name": "TSEBEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8902929874775,
                9.02190630240805
            ]
        },
        "properties": {
            "stop_id": "AB049T1S17",
            "stop_name": "BONO MESKID"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8862577364861,
                9.02169806494173
            ]
        },
        "properties": {
            "stop_id": "AB049T1S16",
            "stop_name": "FERES BET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8767674925414,
                9.02124611086806
            ]
        },
        "properties": {
            "stop_id": "AB049T1S14",
            "stop_name": "AYAT SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8425032435261,
                9.02152136608593
            ]
        },
        "properties": {
            "stop_id": "AB049T2S14",
            "stop_name": "ST. MICHEAL CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8132812085323,
                9.01971228617525
            ]
        },
        "properties": {
            "stop_id": "AB049T1S3",
            "stop_name": "CENTURY MALL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7772166904975,
                8.98162834269778
            ]
        },
        "properties": {
            "stop_id": "AB048T1S1",
            "stop_name": "BOLE MIKAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.791198471089,
                8.98700267201099
            ]
        },
        "properties": {
            "stop_id": "AB048T1S2",
            "stop_name": "BOLE DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7680428179853,
                9.01939486164123
            ]
        },
        "properties": {
            "stop_id": "AB039T1S9",
            "stop_name": "ZENEBEWERK HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7374295924148,
                9.07109699053488
            ]
        },
        "properties": {
            "stop_id": "AB045T1S16",
            "stop_name": "DILBER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7564097892096,
                9.17425522193374
            ]
        },
        "properties": {
            "stop_id": "AB030T1S2",
            "stop_name": "KAJIMA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7547095818351,
                9.16675168501267
            ]
        },
        "properties": {
            "stop_id": "AB030T1S3",
            "stop_name": "NEW INTERNATRONAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7538623574056,
                9.14490292411494
            ]
        },
        "properties": {
            "stop_id": "AB030T1S4",
            "stop_name": "ASHEWA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7524490502985,
                9.13413820801823
            ]
        },
        "properties": {
            "stop_id": "AB030T1S5",
            "stop_name": "ABO GABRIEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7395160489696,
                9.1273185930064
            ]
        },
        "properties": {
            "stop_id": "AB030T1S7",
            "stop_name": "SHEFUNEA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7304478020184,
                9.1179461348722
            ]
        },
        "properties": {
            "stop_id": "AB030T1S8",
            "stop_name": "KENENISA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7147017204233,
                9.10954094500205
            ]
        },
        "properties": {
            "stop_id": "AB030T1S10",
            "stop_name": "CLASI WEHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.69044,
                9.06658058282939
            ]
        },
        "properties": {
            "stop_id": "AB028T2S14",
            "stop_name": "SANSUSI CHAF"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7034084432115,
                9.0593635063099
            ]
        },
        "properties": {
            "stop_id": "AB028T1S4",
            "stop_name": "BERCHIKO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7199873914036,
                9.04626474966603
            ]
        },
        "properties": {
            "stop_id": "AB028T1S10",
            "stop_name": "GIRUM HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7212818761297,
                9.04089813116929
            ]
        },
        "properties": {
            "stop_id": "AB028T2S4",
            "stop_name": "WOREDA 7 TECHNIC SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7457885915224,
                9.02474450587982
            ]
        },
        "properties": {
            "stop_id": "AB029T2S17",
            "stop_name": "KEBELE 11"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.763856229356,
                9.01963789034631
            ]
        },
        "properties": {
            "stop_id": "AB031T1S3",
            "stop_name": "KASANCHIS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.74642,
                9.01759
            ]
        },
        "properties": {
            "stop_id": "AB029T2S15",
            "stop_name": "GOMA QUTEBA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7615458230251,
                9.04276858100302
            ]
        },
        "properties": {
            "stop_id": "AB031T1S7",
            "stop_name": "YEKATIT 12"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.75964,
                8.99534
            ]
        },
        "properties": {
            "stop_id": "AB029T1S6",
            "stop_name": "TEMENJAYAZH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7625586647474,
                9.0541525921882
            ]
        },
        "properties": {
            "stop_id": "AB031T1S10",
            "stop_name": "SEBSEBA MAEKEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7743815832278,
                8.95557491205339
            ]
        },
        "properties": {
            "stop_id": "AB029T2S1",
            "stop_name": "SAINT GEBRAEL / 29 MAZORIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7669539551752,
                9.01669454845219
            ]
        },
        "properties": {
            "stop_id": "AB032T2S3",
            "stop_name": "MENEHARIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7706388906259,
                9.01946306982471
            ]
        },
        "properties": {
            "stop_id": "AB032T2S5",
            "stop_name": "ABISINIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8110664146652,
                9.0213304024356
            ]
        },
        "properties": {
            "stop_id": "AB032T2S12",
            "stop_name": "RADISON BLUE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8533877099383,
                9.03575972921787
            ]
        },
        "properties": {
            "stop_id": "AB033T1S1",
            "stop_name": "YABEM HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8445905953804,
                9.03320823862184
            ]
        },
        "properties": {
            "stop_id": "AB033T1S2",
            "stop_name": "WOSEN"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8385788077642,
                9.03043330871576
            ]
        },
        "properties": {
            "stop_id": "AB033T1S3",
            "stop_name": "AKIM GENBATA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8333598944277,
                9.02841570627208
            ]
        },
        "properties": {
            "stop_id": "AB033T1S4",
            "stop_name": "HILL SIDE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8271217801418,
                9.02598819182059
            ]
        },
        "properties": {
            "stop_id": "AB033T1S5",
            "stop_name": "HANA MARIAM METATEFIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8100409243125,
                9.02152771920034
            ]
        },
        "properties": {
            "stop_id": "AB033T1S8",
            "stop_name": "ABISINIA CAFE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7730531215774,
                9.03247734807051
            ]
        },
        "properties": {
            "stop_id": "AB033T1S16",
            "stop_name": "ADDIS VIEW HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7668314073413,
                8.90294538764503
            ]
        },
        "properties": {
            "stop_id": "AB098T1S11",
            "stop_name": "CHERALIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7638892011908,
                8.91116877303832
            ]
        },
        "properties": {
            "stop_id": "AB098T1S12",
            "stop_name": "GEBRAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7632008431012,
                8.93801082178955
            ]
        },
        "properties": {
            "stop_id": "AB098T1S15",
            "stop_name": "GUMRUK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.78383,
                8.88575
            ]
        },
        "properties": {
            "stop_id": "AB098T1S9",
            "stop_name": "GELAN CONDOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6851967891677,
                8.97938839458383
            ]
        },
        "properties": {
            "stop_id": "AB099T1S3",
            "stop_name": "GERAR"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6526518618482,
                8.92299457456549
            ]
        },
        "properties": {
            "stop_id": "AB099T2S1",
            "stop_name": "ALEM GENA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.67018,
                8.94967
            ]
        },
        "properties": {
            "stop_id": "AB099T2S6",
            "stop_name": "SELASSIE MEWCHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7207237950468,
                8.96667451781659
            ]
        },
        "properties": {
            "stop_id": "AB100T1S2",
            "stop_name": "NISIR MASELTEGNA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.72201,
                8.97734
            ]
        },
        "properties": {
            "stop_id": "AB100T1S4",
            "stop_name": "GEBRE KIRSTOS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.722930560917,
                8.98844937452472
            ]
        },
        "properties": {
            "stop_id": "AB100T1S6",
            "stop_name": "BISRATE GEBRAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7278650605186,
                8.99393382564822
            ]
        },
        "properties": {
            "stop_id": "AB100T1S8",
            "stop_name": "AUSTRIA EMBASSY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.73382,
                9.00417
            ]
        },
        "properties": {
            "stop_id": "AB100T1S10",
            "stop_name": "LIDETA TSEBEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7341403583886,
                9.01089128739232
            ]
        },
        "properties": {
            "stop_id": "AB100T1S11",
            "stop_name": "FIRD BET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7334807397341,
                9.02142906736258
            ]
        },
        "properties": {
            "stop_id": "AB100T1S13",
            "stop_name": "ABNET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.73382,
                9.00931
            ]
        },
        "properties": {
            "stop_id": "AB100T2S4",
            "stop_name": "DESSIE HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7275039784515,
                8.99365653026526
            ]
        },
        "properties": {
            "stop_id": "AB100T2S6",
            "stop_name": "MECHARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7246217636325,
                8.97337237670871
            ]
        },
        "properties": {
            "stop_id": "AB100T2S11",
            "stop_name": "SHEGED HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8778262263491,
                9.04277867554892
            ]
        },
        "properties": {
            "stop_id": "AB101T1S14",
            "stop_name": "TAFO MEBRAT HAIL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.87797,
                9.03042939031871
            ]
        },
        "properties": {
            "stop_id": "AB101T1S12",
            "stop_name": "KESTE DEMENA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8678248632491,
                9.02105553251221
            ]
        },
        "properties": {
            "stop_id": "AB101T2S10",
            "stop_name": "AYAT ZONE 2"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8719809773597,
                9.02131338763109
            ]
        },
        "properties": {
            "stop_id": "AB101T2S9",
            "stop_name": "AYAT TRAIN STATION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7570585419623,
                9.01756729151364
            ]
        },
        "properties": {
            "stop_id": "AB102T2S3",
            "stop_name": "FILWEHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.770228597127,
                9.01663985776641
            ]
        },
        "properties": {
            "stop_id": "AB102T2S4",
            "stop_name": "KAZZANCHIS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7866963011498,
                9.02213831969339
            ]
        },
        "properties": {
            "stop_id": "AB102T2S8",
            "stop_name": "DENBERUA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8192387591065,
                9.0238807843491
            ]
        },
        "properties": {
            "stop_id": "AB102T2S13",
            "stop_name": "MENAHERIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.87777,
                9.03814
            ]
        },
        "properties": {
            "stop_id": "AB097T1S14",
            "stop_name": "TAFO GEBRAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.87789,
                9.04664
            ]
        },
        "properties": {
            "stop_id": "AB097T1S16",
            "stop_name": "TAFO CONDOMINIUM 2"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.87795,
                9.05052
            ]
        },
        "properties": {
            "stop_id": "AB097T1S17",
            "stop_name": "TAFO CONDOMINIUM 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8841616836284,
                9.06307015217557
            ]
        },
        "properties": {
            "stop_id": "AB097T1S20",
            "stop_name": "MAKEFAFEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8891990523973,
                9.06705690311408
            ]
        },
        "properties": {
            "stop_id": "AB097T1S21",
            "stop_name": "GARI TERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8938021685803,
                9.07070435322129
            ]
        },
        "properties": {
            "stop_id": "AB097T1S22",
            "stop_name": "CCD"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.89522,
                9.07183
            ]
        },
        "properties": {
            "stop_id": "AB097T1S23",
            "stop_name": "140"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9082878577523,
                9.08221286136165
            ]
        },
        "properties": {
            "stop_id": "AB097T1S27",
            "stop_name": "TAFO MISSION SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7434139537893,
                9.03432553915338
            ]
        },
        "properties": {
            "stop_id": "AB088T2S33",
            "stop_name": "PHARMACY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.75175,
                9.03867
            ]
        },
        "properties": {
            "stop_id": "AB088T1S2",
            "stop_name": "S.T GIORGIS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.74582,
                9.04888
            ]
        },
        "properties": {
            "stop_id": "AB088T2S29",
            "stop_name": "SHALA PARK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7377285371216,
                9.07166561137445
            ]
        },
        "properties": {
            "stop_id": "AB088T2S24",
            "stop_name": "DIL BER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7229996743457,
                9.08437032565601
            ]
        },
        "properties": {
            "stop_id": "AB088T1S9",
            "stop_name": "ENTOTO KELA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7095239017795,
                9.10512062579164
            ]
        },
        "properties": {
            "stop_id": "AB088T1S11",
            "stop_name": "WESERBI REALESTATE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7158204443282,
                9.11006484175716
            ]
        },
        "properties": {
            "stop_id": "AB088T1S12",
            "stop_name": "MEDRET HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7300957898286,
                9.11760965250739
            ]
        },
        "properties": {
            "stop_id": "AB088T1S14",
            "stop_name": "KBUREA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7397675748615,
                9.12779701849589
            ]
        },
        "properties": {
            "stop_id": "AB088T1S15",
            "stop_name": "SHEFINE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7522534581452,
                9.13392757032812
            ]
        },
        "properties": {
            "stop_id": "AB088T2S14",
            "stop_name": "DORO ERBATA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7549356890192,
                9.14083212036649
            ]
        },
        "properties": {
            "stop_id": "AB088T2S13",
            "stop_name": "TULU FATI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7542471544878,
                9.15600338912621
            ]
        },
        "properties": {
            "stop_id": "AB088T1S11",
            "stop_name": "TABYA HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7547107374684,
                9.16677812007134
            ]
        },
        "properties": {
            "stop_id": "AB088T2S10",
            "stop_name": "DERE HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7579602180005,
                9.17919256989845
            ]
        },
        "properties": {
            "stop_id": "AB088T1S22",
            "stop_name": "SELARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7568336481747,
                9.03890808987981
            ]
        },
        "properties": {
            "stop_id": "AB089T2S31",
            "stop_name": "RAS MEKONIN DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7579466300194,
                9.03635363968017
            ]
        },
        "properties": {
            "stop_id": "AB089T2S30",
            "stop_name": "KIDST MARYAM METATEFYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8386,
                9.03044
            ]
        },
        "properties": {
            "stop_id": "AB089T2S19",
            "stop_name": "WESEN MICHAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.854525115147,
                9.03608878964863
            ]
        },
        "properties": {
            "stop_id": "AB089T2S17",
            "stop_name": "KARA CONDOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8736818268349,
                9.05697819857648
            ]
        },
        "properties": {
            "stop_id": "AB089T2S14",
            "stop_name": "YEKA ABADO MEGENTEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.877910122981,
                9.05706
            ]
        },
        "properties": {
            "stop_id": "AB089T2S13",
            "stop_name": "TAFO ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.88128642877,
                9.06068619276634
            ]
        },
        "properties": {
            "stop_id": "AB089T1S12",
            "stop_name": "ABA KIROS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9075406028774,
                9.08179131105588
            ]
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9167509572879,
                9.08890730486097
            ]
        },
        "properties": {
            "stop_id": "AB089T2S8",
            "stop_name": "MNS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9273399347357,
                9.08800990210473
            ]
        },
        "properties": {
            "stop_id": "AB089T1S18",
            "stop_name": "LEGEDADI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9508253941732,
                9.09528670517517
            ]
        },
        "properties": {
            "stop_id": "AB089T1S20",
            "stop_name": "44 MAZORIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9693697042548,
                9.10055833493528
            ]
        },
        "properties": {
            "stop_id": "AB089T1S21",
            "stop_name": "LEGEBERI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9841458577815,
                9.10470021761055
            ]
        },
        "properties": {
            "stop_id": "AB089T1S22",
            "stop_name": "EJERE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.9861821307198,
                9.11074001649219
            ]
        },
        "properties": {
            "stop_id": "AB089T1S23",
            "stop_name": "DIRE MAZORIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.61612,
                8.90731
            ]
        },
        "properties": {
            "stop_id": "AB091S23",
            "stop_name": "KIDA HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.62212,
                8.91142
            ]
        },
        "properties": {
            "stop_id": "AB091T1S22",
            "stop_name": "SEBETA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6466066576387,
                8.92137960756125
            ]
        },
        "properties": {
            "stop_id": "AB091T1S18",
            "stop_name": "MAMA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6548186909404,
                8.92442414092964
            ]
        },
        "properties": {
            "stop_id": "AB091T1S16",
            "stop_name": "UBEDI ACADAMI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.65901,
                8.92749
            ]
        },
        "properties": {
            "stop_id": "AB091T1S15",
            "stop_name": "TABELEW"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.67132,
                8.96118
            ]
        },
        "properties": {
            "stop_id": "AB091T1S12",
            "stop_name": "WELETE MARYAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7157487115562,
                8.99265459684129
            ]
        },
        "properties": {
            "stop_id": "AB091T1S5",
            "stop_name": "3 KUTR MAZORIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.69879,
                9.05134
            ]
        },
        "properties": {
            "stop_id": "AB094S15",
            "stop_name": "MIKILI LAND"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.70076,
                9.05867
            ]
        },
        "properties": {
            "stop_id": "AB094T2S2",
            "stop_name": "BERCHEKO CONDOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.70673,
                9.0578
            ]
        },
        "properties": {
            "stop_id": "AB094T2S4",
            "stop_name": "AWELIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7136941866877,
                9.05717469870037
            ]
        },
        "properties": {
            "stop_id": "AB094T2S6",
            "stop_name": "WINGET ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7088724206919,
                9.05205778298526
            ]
        },
        "properties": {
            "stop_id": "AB094T1S14",
            "stop_name": "4 MENTA ADEBABAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.71156,
                9.05253
            ]
        },
        "properties": {
            "stop_id": "AB094T1S13",
            "stop_name": "4 MENTA SEFER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.71822,
                9.06916
            ]
        },
        "properties": {
            "stop_id": "AB094T2S7",
            "stop_name": "KEBT BERET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.74315,
                9.05281
            ]
        },
        "properties": {
            "stop_id": "AB094T2S12",
            "stop_name": "SEMEN MAZEGAGA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7489974803664,
                9.04350253391258
            ]
        },
        "properties": {
            "stop_id": "AB094T2S13",
            "stop_name": "SEMEN HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7134516781256,
                9.03356726272325
            ]
        },
        "properties": {
            "stop_id": "AB095T2S18",
            "stop_name": "18 MAZORIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.726583474888,
                9.01132247173266
            ]
        },
        "properties": {
            "stop_id": "AB090T2S14",
            "stop_name": "GOLF CLUB"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7429,
                9.01059
            ]
        },
        "properties": {
            "stop_id": "AB090T1S5",
            "stop_name": "TEGBARED TVET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7419,
                8.92704
            ]
        },
        "properties": {
            "stop_id": "AB092T1S1",
            "stop_name": "HANA MARYAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7326102009489,
                8.95547361707963
            ]
        },
        "properties": {
            "stop_id": "AB092T1S5",
            "stop_name": "GEBRAEL DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7325271664411,
                8.95559379648128
            ]
        },
        "properties": {
            "stop_id": "AB092T213",
            "stop_name": "GEBRIAEL DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.732866233865,
                8.96160105500975
            ]
        },
        "properties": {
            "stop_id": "AB092T2S12",
            "stop_name": "GERMAN DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7341813601822,
                8.97903340045547
            ]
        },
        "properties": {
            "stop_id": "AB092T1S8",
            "stop_name": "MEKANISA SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7394738131956,
                8.99914424856744
            ]
        },
        "properties": {
            "stop_id": "AB092T2S5",
            "stop_name": "MICHEAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7423655292743,
                9.00531263663889
            ]
        },
        "properties": {
            "stop_id": "AB092T1S13",
            "stop_name": "POPOLARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8778130329515,
                9.05561155794413
            ]
        },
        "properties": {
            "stop_id": "AB097T2S6",
            "stop_name": "TAFO SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8778130329515,
                9.05561155794413
            ]
        },
        "properties": {
            "stop_id": "AB097T2S6",
            "stop_name": "TAFO SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7191054092261,
                8.9997130952353
            ]
        },
        "properties": {
            "stop_id": "AB090T2S10",
            "stop_name": "DILDIY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.87743,
                9.04258
            ]
        },
        "properties": {
            "stop_id": "AB097T2S9",
            "stop_name": "MEBRAT HAIL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7479123928047,
                9.01281179152315
            ]
        },
        "properties": {
            "stop_id": "AB090T1S4",
            "stop_name": "SHEBELE HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6875266293356,
                9.03428706541137
            ]
        },
        "properties": {
            "stop_id": "AB095T2S16",
            "stop_name": "FELI DORO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8108556503376,
                9.02135405965884
            ]
        },
        "properties": {
            "stop_id": "AB123T1S",
            "stop_name": "ABISSNIA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8270141720447,
                9.0258413906842
            ]
        },
        "properties": {
            "stop_id": "AB123T1S4",
            "stop_name": "HANA MARIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8448670308861,
                9.03321325380873
            ]
        },
        "properties": {
            "stop_id": "AB123T1SS7",
            "stop_name": "WOSONE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8602561305404,
                9.03780382423314
            ]
        },
        "properties": {
            "stop_id": "AB123T1S9",
            "stop_name": "KARA CHORE SEFER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8705146131912,
                9.05016953953365
            ]
        },
        "properties": {
            "stop_id": "AB123T1S11A",
            "stop_name": "KARA CONDOMINUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.874241912077,
                9.05801096393021
            ]
        },
        "properties": {
            "stop_id": "AB123T1S12",
            "stop_name": "SARA AMIPULLI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8757918398718,
                9.06898387990505
            ]
        },
        "properties": {
            "stop_id": "AB123T1S13",
            "stop_name": "YEKA ABADO CONDOMINUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8732665380766,
                9.0630763743506
            ]
        },
        "properties": {
            "stop_id": "AB123T12S2",
            "stop_name": "MESKELEGNA ABABDO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8737897843412,
                9.05717426702573
            ]
        },
        "properties": {
            "stop_id": "AB123T12S3",
            "stop_name": "SARA AMIPULLLI FABRICA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8640295267811,
                9.0401464522334
            ]
        },
        "properties": {
            "stop_id": "AB123T2S5",
            "stop_name": "MEDHANALEM CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.73797,
                9.03442
            ]
        },
        "properties": {
            "stop_id": "AB012T2S13",
            "stop_name": "GOGAM BERENDA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8333029769853,
                9.0284875023204
            ]
        },
        "properties": {
            "stop_id": "AB123T2S9",
            "stop_name": "HILLSIDE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8055315001751,
                9.00724543983062
            ]
        },
        "properties": {
            "stop_id": "ABR001S1",
            "stop_name": "አንበሳ ጋራዥ/Anbessa Garage"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8097742192029,
                9.00499446366462
            ]
        },
        "properties": {
            "stop_id": "ABR002S2",
            "stop_name": "መብራት ሃይል ኮዶሚኒየም/ Mebrathaile Condominum"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8209353788708,
                8.99933443772346
            ]
        },
        "properties": {
            "stop_id": "ABR001S3",
            "stop_name": "አለማየሁ ሕንፃ / Alemayehu Bldg."
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8227078998567,
                8.99756923932293
            ]
        },
        "properties": {
            "stop_id": "ABR001S4",
            "stop_name": "ጎሮ ጉሊት / Goro Gulit"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8263813322143,
                8.99424388939022
            ]
        },
        "properties": {
            "stop_id": "ABR001S5",
            "stop_name": "ጎሮ 2ኛ ደረጃ ት/ቤት /  Goro School"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8288611008121,
                8.9916641678121
            ]
        },
        "properties": {
            "stop_id": "ABR001S6",
            "stop_name": "ጎሮ መስጊድ / Goro Mosque"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8054295911948,
                9.02095715769866
            ]
        },
        "properties": {
            "stop_id": "ABR002S1",
            "stop_name": "እስራኤል ኢምባሲ / Israel Embassy"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.815305452828,
                9.0219904008009
            ]
        },
        "properties": {
            "stop_id": "ABR002S2",
            "stop_name": "ኤልፎራ / Elfroa"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8288232282074,
                9.02652483858293
            ]
        },
        "properties": {
            "stop_id": "ABR002S5",
            "stop_name": "ኮንዶሚኒየም/ኢትዮ ቻይና/ - Condominum(Ethio-China)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8316257417153,
                9.03758320751252
            ]
        },
        "properties": {
            "stop_id": "ABR003S9",
            "stop_name": "ሃና ማርያም / Hana Mariam"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8374641277633,
                9.03729763903751
            ]
        },
        "properties": {
            "stop_id": "ABR003S11",
            "stop_name": "ኮተቤ ኮሌጅ/ Kotebe College"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8503377996793,
                9.0390677622599
            ]
        },
        "properties": {
            "stop_id": "ABR003S13",
            "stop_name": "መሳለሚያ/ Mesalemiya"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8646973377764,
                9.04069395765979
            ]
        },
        "properties": {
            "stop_id": "ABR003S14",
            "stop_name": "ካራአሎ / Karalo"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7350923311417,
                8.94151566765789
            ]
        },
        "properties": {
            "stop_id": "ABR005",
            "stop_name": "ኦይል ሊቢያ/OilLibya"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7441121486121,
                8.93584330104618
            ]
        },
        "properties": {
            "stop_id": "ABR005S19",
            "stop_name": "ሀና ማርያም ድልድይ/ Hana Mariam Dildy"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7347961312967,
                8.92038375572922
            ]
        },
        "properties": {
            "stop_id": "ABR005S22",
            "stop_name": "ሠፈራ/Sefera"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7336148778611,
                8.94881752586731
            ]
        },
        "properties": {
            "stop_id": "ABR005S12",
            "stop_name": "ለቡ አደባባይ/Lebu Square"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7367678714446,
                8.98451073124308
            ]
        },
        "properties": {
            "stop_id": "ABR005S5",
            "stop_name": "ቫቲካን ኤምባሲ/Vatican Embassy"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7383436461988,
                8.99291358910354
            ]
        },
        "properties": {
            "stop_id": "ABR005S4",
            "stop_name": "ሳር ቤት/SAR BET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.763203110311,
                9.03451250435462
            ]
        },
        "properties": {
            "stop_id": "ABR007S6",
            "stop_name": "4ኪሎ/4 KILO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7703779685871,
                9.04925321867415
            ]
        },
        "properties": {
            "stop_id": "ABR007S10",
            "stop_name": "ፈረንሳይ ኤምባሲ/ Embassy of France"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7799573852015,
                9.04315812365651
            ]
        },
        "properties": {
            "stop_id": "ABR007S13",
            "stop_name": "ቤላ /BELA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.785301618349,
                9.04653562953794
            ]
        },
        "properties": {
            "stop_id": "ABR007S15",
            "stop_name": "ጣልያን ኤምባሲ/Embassy of Italy"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7487147772434,
                8.97007031636253
            ]
        },
        "properties": {
            "stop_id": "ABR010S1",
            "stop_name": "MEBRAt NIGIST HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7486690114347,
                8.96687332765073
            ]
        },
        "properties": {
            "stop_id": "ABR010S2",
            "stop_name": "GOFA MEBRAT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7498653296732,
                8.95853986817075
            ]
        },
        "properties": {
            "stop_id": "ABR010S3",
            "stop_name": "ድልድይ ማርያም/DILDIY MARIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7488850260516,
                8.97588286877328
            ]
        },
        "properties": {
            "stop_id": "ABR010S0",
            "stop_name": "ጎፋ  ማዞርያ/GOFA MAZORIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6777503143273,
                9.00060031949532
            ]
        },
        "properties": {
            "stop_id": "ABR012S1",
            "stop_name": "ዓለም ባንክ/ALEM BANK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6833447267785,
                8.99608729565198
            ]
        },
        "properties": {
            "stop_id": "ABR012S2",
            "stop_name": "ትሮፒካል/Tropical"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6771388831235,
                9.01139355896544
            ]
        },
        "properties": {
            "stop_id": "ABR012S4",
            "stop_name": "ቤቴል ሸማቾች/Betel Shemachoch"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6989883954964,
                9.0148975181464
            ]
        },
        "properties": {
            "stop_id": "ABR013S1",
            "stop_name": "መንዲዳ/MENDIDA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6941390504103,
                9.00419026680405
            ]
        },
        "properties": {
            "stop_id": "ABR013S2",
            "stop_name": "ቤቴል/BETEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6894863838869,
                8.99315316712806
            ]
        },
        "properties": {
            "stop_id": "ABR013S3",
            "stop_name": "ኪዳነ ምህረት/KIDANE MIHERET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.695988789982,
                8.98389362304906
            ]
        },
        "properties": {
            "stop_id": "ABR013S4",
            "stop_name": "አየር ጤና/AYER TENA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7195270606947,
                8.9498983471849
            ]
        },
        "properties": {
            "stop_id": "ABR014S1",
            "stop_name": "ለቡ ሙዚቃ ቤት/LEBU MUSICA BET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7815700445665,
                9.04295420386098
            ]
        },
        "properties": {
            "stop_id": "ABR007S7",
            "stop_name": "BELA HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7781965475968,
                9.04556843837047
            ]
        },
        "properties": {
            "stop_id": "ABR007S5",
            "stop_name": "ABO MEGENTEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7756946718537,
                9.04633357658612
            ]
        },
        "properties": {
            "stop_id": "ABR007S6",
            "stop_name": "MENAFESHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7728699734341,
                9.04870868276718
            ]
        },
        "properties": {
            "stop_id": "ABR007S7",
            "stop_name": "BELA METATEFIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7702066863527,
                9.04732187770693
            ]
        },
        "properties": {
            "stop_id": "ABR007S8",
            "stop_name": "DILDYE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8045711602692,
                8.85541738927083
            ]
        },
        "properties": {
            "stop_id": "ABR015S01",
            "stop_name": "UNISA UNIVERSITY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8001323484669,
                8.8534357541445
            ]
        },
        "properties": {
            "stop_id": "ABR015S02",
            "stop_name": "UNISA UNIVERSITY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7852179408113,
                8.85400991109457
            ]
        },
        "properties": {
            "stop_id": "ABR015S3",
            "stop_name": "MEBRAT HAYEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7800124251523,
                8.85803695895532
            ]
        },
        "properties": {
            "stop_id": "ABR015S4",
            "stop_name": "GELAN CONDOMINUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7617971556291,
                8.8777808163129
            ]
        },
        "properties": {
            "stop_id": "ABR015S5",
            "stop_name": "GELAN CONDOMINUM 2"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7671963648941,
                8.87943937956339
            ]
        },
        "properties": {
            "stop_id": "ABR015S5",
            "stop_name": "GELAN CODOMINUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7717078117986,
                8.88186342005219
            ]
        },
        "properties": {
            "stop_id": "ABR015S6",
            "stop_name": "GELA CODOMINUM TAXI TERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7766792810171,
                8.88349006981582
            ]
        },
        "properties": {
            "stop_id": "ABR015S7",
            "stop_name": "SELAM HINSTA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.775387990311,
                8.89083382519783
            ]
        },
        "properties": {
            "stop_id": "ABR015S8",
            "stop_name": "KALTY STADIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7723817041358,
                8.89528705140505
            ]
        },
        "properties": {
            "stop_id": "ABR015S8",
            "stop_name": "KALITY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7655620750941,
                8.90662120453184
            ]
        },
        "properties": {
            "stop_id": "ABR015S9",
            "stop_name": "CROWN HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7635767156335,
                8.91972102253334
            ]
        },
        "properties": {
            "stop_id": "ABR015S10",
            "stop_name": "KALITY MAREMIYA MEGENTIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7659978857074,
                8.92525421897281
            ]
        },
        "properties": {
            "stop_id": "ABR015S11",
            "stop_name": "MEDROC TERMINAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7678702572313,
                8.93544337265162
            ]
        },
        "properties": {
            "stop_id": "ABR015S12",
            "stop_name": "KALITY MASELTGNA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7643837723248,
                8.93398437985201
            ]
        },
        "properties": {
            "stop_id": "ABR015S13",
            "stop_name": "KALITY MASELTEGNA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7585164701789,
                8.93101056770184
            ]
        },
        "properties": {
            "stop_id": "ABR01514",
            "stop_name": "KADISCO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7544125869035,
                8.93092685414012
            ]
        },
        "properties": {
            "stop_id": "ABR015S15",
            "stop_name": "HANA MARIAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7444414014823,
                8.93615692164796
            ]
        },
        "properties": {
            "stop_id": "ABR015S15",
            "stop_name": "HANA MARIYAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7408701756232,
                8.93693026367506
            ]
        },
        "properties": {
            "stop_id": "ABR015S16",
            "stop_name": "X HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.734841462139,
                8.93835336816722
            ]
        },
        "properties": {
            "stop_id": "ABR015S17",
            "stop_name": "HAILE GARMENT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7363183758841,
                8.9368744555425
            ]
        },
        "properties": {
            "stop_id": "ABR015S17",
            "stop_name": "HAILE GARMENT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7338608882591,
                8.93219052824109
            ]
        },
        "properties": {
            "stop_id": "ABR015S18A",
            "stop_name": "KOTARI CONDOMINUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7342038873529,
                8.92493131860397
            ]
        },
        "properties": {
            "stop_id": "ABR015S19",
            "stop_name": "SEFERA SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7384812878169,
                8.91026097588585
            ]
        },
        "properties": {
            "stop_id": "ABR015S19",
            "stop_name": "SEFERA CODOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.750934172564,
                8.9000392258889
            ]
        },
        "properties": {
            "stop_id": "ABR015S20",
            "stop_name": "KALITY 40/60"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7523545923407,
                8.88635662376662
            ]
        },
        "properties": {
            "stop_id": "ABR015S21",
            "stop_name": "ENDODYE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7631229762803,
                8.95312209468189
            ]
        },
        "properties": {
            "stop_id": "ABR016S1",
            "stop_name": "SARIS NIGD BANK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7618744388581,
                8.95267323813949
            ]
        },
        "properties": {
            "stop_id": "ABR016S2",
            "stop_name": "DAMA HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7598004910532,
                8.95148726589417
            ]
        },
        "properties": {
            "stop_id": "ABR016S3",
            "stop_name": "KOKEB PASTA FACTORY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.759362773426,
                8.94889705612243
            ]
        },
        "properties": {
            "stop_id": "ABR016S4",
            "stop_name": "58 KEBELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7567864925347,
                8.94491081491843
            ]
        },
        "properties": {
            "stop_id": "ABR016S5",
            "stop_name": "58 MEGENTIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7482239019995,
                8.93921963871162
            ]
        },
        "properties": {
            "stop_id": "ABR016S6",
            "stop_name": "MARIYAM CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7454871246448,
                8.93614751966173
            ]
        },
        "properties": {
            "stop_id": "ABR016S7",
            "stop_name": "HANA MARIYAM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8174520712903,
                9.00282849317297
            ]
        },
        "properties": {
            "stop_id": "ABR001S9",
            "stop_name": "JACROS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8298332270301,
                8.98973497828905
            ]
        },
        "properties": {
            "stop_id": "ABR017S1",
            "stop_name": "GORO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8361363608613,
                8.97448331889782
            ]
        },
        "properties": {
            "stop_id": "ABR017S2",
            "stop_name": "SYNIXS ELECTRONICS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8370534835087,
                8.96585250611284
            ]
        },
        "properties": {
            "stop_id": "ABR017S5",
            "stop_name": "ICT PARK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8356861370162,
                8.95829214087266
            ]
        },
        "properties": {
            "stop_id": "ABR017S6",
            "stop_name": "AKAKI WOREDA 14"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8348190392405,
                8.95555785240489
            ]
        },
        "properties": {
            "stop_id": "ABR017S7",
            "stop_name": "FLUWUHA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.831450697881,
                8.95005626992971
            ]
        },
        "properties": {
            "stop_id": "ABR017S7",
            "stop_name": "ARSEMA TESBEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8247473650764,
                8.94333566108681
            ]
        },
        "properties": {
            "stop_id": "ABR017S8",
            "stop_name": "KABA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8210788744868,
                8.93783389384877
            ]
        },
        "properties": {
            "stop_id": "ABR017S8",
            "stop_name": "KOYE CONDOMINUM MEGBIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8199783273099,
                8.93058592994976
            ]
        },
        "properties": {
            "stop_id": "ABR017S9",
            "stop_name": "KOYE 1 SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.818577630903,
                8.91755570531626
            ]
        },
        "properties": {
            "stop_id": "ABR017S10",
            "stop_name": "KOYA CONDOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8156761883458,
                8.90085129864942
            ]
        },
        "properties": {
            "stop_id": "ABR017S10",
            "stop_name": "KOYA FETCHAE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8140420425377,
                8.88717749861088
            ]
        },
        "properties": {
            "stop_id": "ABR017S11",
            "stop_name": "AASTU MEGBIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8177105331273,
                8.87979672938307
            ]
        },
        "properties": {
            "stop_id": "ABR017S12",
            "stop_name": "TULUDIMTU 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7876205728141,
                8.87691357605031
            ]
        },
        "properties": {
            "stop_id": "ABR004S01",
            "stop_name": "TIRUNESH BEGING HOSPITAL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7902260348806,
                8.87945898973605
            ]
        },
        "properties": {
            "stop_id": "ABR004S02",
            "stop_name": "ADVENTIST MISSION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.792177004876,
                8.88412141688012
            ]
        },
        "properties": {
            "stop_id": "ABR004S03",
            "stop_name": "KABA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7998641601569,
                8.89001938462629
            ]
        },
        "properties": {
            "stop_id": "ABR004S5",
            "stop_name": "KILINTO CONDOMINUM METATEFIAY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8143421917678,
                8.89913386446332
            ]
        },
        "properties": {
            "stop_id": "ABR004S9",
            "stop_name": "KILINTO METATEFIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8084642693459,
                8.89652269008915
            ]
        },
        "properties": {
            "stop_id": "ABR004S10",
            "stop_name": "HENIKEN"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8038369687158,
                8.89408447890316
            ]
        },
        "properties": {
            "stop_id": "ABR019S01",
            "stop_name": "KILINTO CONDIMINIUM METATEFIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8028239650644,
                8.89724344197504
            ]
        },
        "properties": {
            "stop_id": "ABR019S2",
            "stop_name": "KILINTO CONDIMIUM MAZORIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8161389184088,
                8.89992874507677
            ]
        },
        "properties": {
            "stop_id": "ABR004S12",
            "stop_name": "KOYE METATEFIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8204327198944,
                8.901320811628
            ]
        },
        "properties": {
            "stop_id": "ABR004S13A",
            "stop_name": "KOYE SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8238177362111,
                8.89511001227601
            ]
        },
        "properties": {
            "stop_id": "ABR004S14",
            "stop_name": "KOYE POLICE STATION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8264535848713,
                8.89175011069247
            ]
        },
        "properties": {
            "stop_id": "ABR004S15",
            "stop_name": "KOYE FETCH 2"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8297607782818,
                8.89398742856817
            ]
        },
        "properties": {
            "stop_id": "ABR004S16",
            "stop_name": "KOYE NEFAS"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8298146034094,
                8.89893239531228
            ]
        },
        "properties": {
            "stop_id": "ABR019S01",
            "stop_name": "KOYE NETWORK 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8315725209806,
                8.89565183946729
            ]
        },
        "properties": {
            "stop_id": "ABR019S02",
            "stop_name": "KOYE NEFAS MEGENTEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.839465393308,
                8.88535386092872
            ]
        },
        "properties": {
            "stop_id": "ABR020S01",
            "stop_name": "KOYE 18"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8359761932803,
                8.88986255155814
            ]
        },
        "properties": {
            "stop_id": "ABR020S03",
            "stop_name": "KOYE 18 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8306047784793,
                8.99038574666905
            ]
        },
        "properties": {
            "stop_id": "ABR001S11",
            "stop_name": "GORO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8331439927488,
                8.98868449905211
            ]
        },
        "properties": {
            "stop_id": "ABR001S12",
            "stop_name": "SILASIE MEGENTIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8360117067665,
                8.98662369871122
            ]
        },
        "properties": {
            "stop_id": "ABR001S13",
            "stop_name": "GORO SEFERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8377518675946,
                8.98420333951297
            ]
        },
        "properties": {
            "stop_id": "ABR001S14",
            "stop_name": "SEFERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8406107032407,
                8.98101124686773
            ]
        },
        "properties": {
            "stop_id": "ABR001S15",
            "stop_name": "FESAH MASWEGEJA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8537950850249,
                8.97246086026461
            ]
        },
        "properties": {
            "stop_id": "ABR001S16",
            "stop_name": "BOLE LEMI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8553044081921,
                8.97441650492652
            ]
        },
        "properties": {
            "stop_id": "ABR001S17",
            "stop_name": "BOLE INDUSTRY PARK"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8192937330968,
                9.02466330434728
            ]
        },
        "properties": {
            "stop_id": "ABR003S01",
            "stop_name": "LAMBERET MENAHARIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8203413809423,
                9.02799530581687
            ]
        },
        "properties": {
            "stop_id": "ABR003S02",
            "stop_name": "WUHA GEDEB"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8214778125035,
                9.03139742358505
            ]
        },
        "properties": {
            "stop_id": "ABR003S03",
            "stop_name": "BERETA BERET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8281188344392,
                9.03539574630624
            ]
        },
        "properties": {
            "stop_id": "ABR003S4",
            "stop_name": "02 KEBELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8346355591729,
                9.03707923761748
            ]
        },
        "properties": {
            "stop_id": "ABR003S06",
            "stop_name": "WONDERAD SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8428480528768,
                9.03826293773521
            ]
        },
        "properties": {
            "stop_id": "ABR003S07",
            "stop_name": "MESALEMIYA MEGENTEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8535908824787,
                9.03878902542783
            ]
        },
        "properties": {
            "stop_id": "ABR003S08",
            "stop_name": "KARALO HOTEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8577814738606,
                9.04094597693313
            ]
        },
        "properties": {
            "stop_id": "ABR003S09",
            "stop_name": "ACHA DUKET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.8613505792325,
                9.04126162728927
            ]
        },
        "properties": {
            "stop_id": "ABR003S09",
            "stop_name": "KARA KERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6959642735929,
                8.95382908955501
            ]
        },
        "properties": {
            "stop_id": "ABR006S01",
            "stop_name": "JEMO 3"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6921288170738,
                8.95184702337263
            ]
        },
        "properties": {
            "stop_id": "ABR006S6",
            "stop_name": "FURI"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6869438480759,
                8.95130326881505
            ]
        },
        "properties": {
            "stop_id": "ABR006S04",
            "stop_name": "X YEGEBEYA MAEKEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6808000149482,
                8.95133834977878
            ]
        },
        "properties": {
            "stop_id": "ABR006S05",
            "stop_name": "POLICE STATION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6711048331918,
                8.9504788651935
            ]
        },
        "properties": {
            "stop_id": "ABR006S06",
            "stop_name": "WELETE SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6706431578701,
                8.95254864095546
            ]
        },
        "properties": {
            "stop_id": "ABR006S07",
            "stop_name": "WELETE SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.671246887137,
                8.95588130598853
            ]
        },
        "properties": {
            "stop_id": "ABR006S08",
            "stop_name": "YETEBABERUT"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6717529543166,
                8.95902976936438
            ]
        },
        "properties": {
            "stop_id": "ABR006S08",
            "stop_name": "WELETE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7133969561741,
                8.95577387186854
            ]
        },
        "properties": {
            "stop_id": "ABR014S01",
            "stop_name": "JEMMO MEDHANIALEM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7330004006047,
                8.94828410070043
            ]
        },
        "properties": {
            "stop_id": "ABR014S04",
            "stop_name": "NEFAS SIK LAFTO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7294135384896,
                8.94858229125888
            ]
        },
        "properties": {
            "stop_id": "ABR014S03",
            "stop_name": "SAFWAY SUPERMARKET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7254981766265,
                8.94885417067274
            ]
        },
        "properties": {
            "stop_id": "ABR014S04",
            "stop_name": "BARNERO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7211655312994,
                8.94918744193514
            ]
        },
        "properties": {
            "stop_id": "ABR014S06",
            "stop_name": "X PRIVATE SCHOOL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.734341034712,
                8.94832356711191
            ]
        },
        "properties": {
            "stop_id": "ABR010S01",
            "stop_name": "LEBE MEBRAT HAILE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7359835334528,
                8.94825340459966
            ]
        },
        "properties": {
            "stop_id": "ABR010S02",
            "stop_name": "WETATOCH MAEKEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7370444988556,
                8.94951632775009
            ]
        },
        "properties": {
            "stop_id": "ABR010S04",
            "stop_name": "LAFTO TAXI TERA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7414259752263,
                8.95273062279496
            ]
        },
        "properties": {
            "stop_id": "ABR010S06",
            "stop_name": "LAFTO CONDOMINIUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7439918246105,
                8.95687890701514
            ]
        },
        "properties": {
            "stop_id": "ABR010S06",
            "stop_name": "LAFTO MICHAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.748750631773,
                8.97239289484581
            ]
        },
        "properties": {
            "stop_id": "ABR010S07",
            "stop_name": "GOFA CONDOMINUM MEGENTEYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6955159158285,
                9.01108288804255
            ]
        },
        "properties": {
            "stop_id": "ABR013S01",
            "stop_name": "BETEL 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6957467534894,
                9.00362933520629
            ]
        },
        "properties": {
            "stop_id": "ABR01302",
            "stop_name": "TELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.6997420206967,
                9.00373456290406
            ]
        },
        "properties": {
            "stop_id": "ABR0130S03",
            "stop_name": "WERA 2"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7038970985923,
                9.00443608010662
            ]
        },
        "properties": {
            "stop_id": "ABR013S04",
            "stop_name": "WERA 1"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7065961235501,
                9.00499729288869
            ]
        },
        "properties": {
            "stop_id": "ABR013S06",
            "stop_name": "WERA SEFER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7073507851337,
                9.00056894960174
            ]
        },
        "properties": {
            "stop_id": "ABR013S07",
            "stop_name": "WERA CONDOMINUM"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7087713245852,
                8.99637731927983
            ]
        },
        "properties": {
            "stop_id": "ABR013S08",
            "stop_name": "TEMETE BAHIR"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7081853520614,
                8.99172963894318
            ]
        },
        "properties": {
            "stop_id": "ABR013S08",
            "stop_name": "KOLFA POLICE STATION"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7329027385174,
                8.95993089139693
            ]
        },
        "properties": {
            "stop_id": "ABR013S09",
            "stop_name": "LEBU GEBRIALE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7325120901682,
                8.95242366542259
            ]
        },
        "properties": {
            "stop_id": "ABR013S10",
            "stop_name": "ARSEMA CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7333067044239,
                8.96466667850802
            ]
        },
        "properties": {
            "stop_id": "ABR013S11",
            "stop_name": "GERMAN SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7329560087468,
                8.96512052150242
            ]
        },
        "properties": {
            "stop_id": "ABR013S12",
            "stop_name": "GERMAN SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7328050764301,
                8.96388176989072
            ]
        },
        "properties": {
            "stop_id": "ABR13S18",
            "stop_name": "GERMAN SQUARE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.762323296154,
                9.06505212626965
            ]
        },
        "properties": {
            "stop_id": "ABR008S1",
            "stop_name": "04 KEBELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7630480375033,
                9.06768064861546
            ]
        },
        "properties": {
            "stop_id": "ABR008S2",
            "stop_name": "04 MEZNAGNA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7653145013593,
                9.07116796538893
            ]
        },
        "properties": {
            "stop_id": "ABR008S3",
            "stop_name": "TABOT MADERIYA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7681080498329,
                9.07292462331777
            ]
        },
        "properties": {
            "stop_id": "ABR008S04",
            "stop_name": "XX"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7693335215689,
                9.07507163799535
            ]
        },
        "properties": {
            "stop_id": "ABR008S5",
            "stop_name": "KIDANE MIHERET TSEBEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7718371735028,
                9.07708851886528
            ]
        },
        "properties": {
            "stop_id": "ABR008S6",
            "stop_name": "KIDANMIHERET"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.769307167338,
                9.06149968678601
            ]
        },
        "properties": {
            "stop_id": "ABR020S01",
            "stop_name": "22 KEBELE"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7661512481898,
                9.05637266091314
            ]
        },
        "properties": {
            "stop_id": "ABR024S02",
            "stop_name": "TEFERI MEKONEN GERBA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7636904218811,
                9.05346753067111
            ]
        },
        "properties": {
            "stop_id": "ABR024S07",
            "stop_name": "EGYPT EMBASSY"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7692511645974,
                8.94535598999955
            ]
        },
        "properties": {
            "stop_id": "ABR0025S1",
            "stop_name": "ABO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7675644938209,
                8.95712302649669
            ]
        },
        "properties": {
            "stop_id": "ABR025S2",
            "stop_name": "SARIS ADDISU SEFER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7688163197878,
                8.95109637262787
            ]
        },
        "properties": {
            "stop_id": "ABR025S6",
            "stop_name": "WUHA TANKER"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7667343355481,
                8.96413880994101
            ]
        },
        "properties": {
            "stop_id": "ABR025S6",
            "stop_name": "KADISCO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7637826616892,
                8.95774781380342
            ]
        },
        "properties": {
            "stop_id": "ABR026S1",
            "stop_name": "ADAY ABABA"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7631106288017,
                8.96376134078795
            ]
        },
        "properties": {
            "stop_id": "ABR026S2",
            "stop_name": "KADISCO"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7623727103369,
                8.96866840917575
            ]
        },
        "properties": {
            "stop_id": "ABR026S3",
            "stop_name": "YOSEPH CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7665762101628,
                8.9708160446753
            ]
        },
        "properties": {
            "stop_id": "ABR025S4",
            "stop_name": "YOSEPH CHURCH"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7669188151642,
                8.97669919760959
            ]
        },
        "properties": {
            "stop_id": "ABR025S5",
            "stop_name": "BOLE MICHAEL"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                38.7852679484166,
                8.98458013073383
            ]
        },
        "properties": {
            "stop_id": "ABR025S7",
            "stop_name": "BOLE GUMRUCK"
        }
    },
]