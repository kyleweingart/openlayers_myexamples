// ****HvxValuesAtPoint****

// Example request filter:
// stormid = 'AL052019' and adv = 'adv032' and windspeed = '34kt'
// take a look at the current single location report and see how the data is organized before loading into store

// potential return data formats

var hvxValuesAtPointWpsReport_1A =
{
    "features": {
        "stormid": "AL052019",
        "adv": "adv032",
        "results": {
            "34kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            }
        }
    }
}

var hvxValuesAtPointWpsReport_1B =
{
    "results": {
        "34kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        }
    }
}

var hvxValuesAtPointWpsReport_1C =
{
    "results": {
        "TOA227_34kt": 1566950400,
        "TOA228_34kt": 1566950400,
        "TOD229_34kt": 1566950400,
        "TOD230_34kt": 1566950400
    }
}

// 34kt and 50kt windspeeds
// Example request filter:
// stormid = 'AL052019' and adv = 'adv032'


var hvxValuesAtPointWpsReport_2A =
{
    "features": {
        "stormid": "AL052019",
        "adv": "adv032",
        "results": {
            "34kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            },
            "50kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            }
        }
    }
}

var hvxValuesAtPointWpsReport_2B =
{
    "results": {
        "34kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        },
        "50kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        }
    }
}

var hvxValuesAtPointWpsReport_2C =
{
    "results": {
        "TOA227_34kt": 1566950400,
        "TOA228_34kt": 1566950400,
        "TOD229_34kt": 1566950400,
        "TOD230_34kt": 1566950400,
        "TOA227_50kt": 1566950400,
        "TOA228_50kt": 1566950400,
        "TOD229_50kt": 1566950400,
        "TOD230_50kt": 1566950400
    }
}

// multiple advisories and windspeeds
// stormid = 'AL052019' and adv in ('adv032', 'adv033')
// we might never need multiple advisories - i believe the TOA/TOD reports are always bound to a single advisory

var hvxValuesAtPointWpsReport_3A =
{
    "features": [{
        "stormid": "AL052019",
        "adv": "adv032",
        "results": {
            "34kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            },
            "50kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            }
        }
    },
    {
        "stormid": "AL052019",
        "adv": "adv033",
        "results": {
            "34kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            },
            "50kt": {
                "TOA227": 1566950400,
                "TOA228": 1566950400,
                "TOD229": 1566950400,
                "TOD230": 1566950400
            }
        }
    }]
}

var hvxValuesAtPointWpsReport_3B =
{
    "results": [{
        "adv": "adv032",
        "34kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        },
        "50kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        }
    },
    {
        "adv": "adv033",
        "34kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        },
        "50kt": {
            "TOA227": 1566950400,
            "TOA228": 1566950400,
            "TOD229": 1566950400,
            "TOD230": 1566950400
        }
    }]
}

var hvxValuesAtPointWpsReport_3C =
{
    "results": [{
        "adv": "adv032",
        "TOA227_34kt": 1566950400,
        "TOA228_34kt": 1566950400,
        "TOD229_34kt": 1566950400,
        "TOD230_34kt": 1566950400,
        "TOA227_50kt": 1566950400,
        "TOA228_50kt": 1566950400,
        "TOD229_50kt": 1566950400,
        "TOD230_50kt": 1566950400
    },
    {
        "adv": "adv033",
        "TOA227_34kt": 1566950400,
        "TOA228_34kt": 1566950400,
        "TOD229_34kt": 1566950400,
        "TOD230_34kt": 1566950400,
        "TOA227_50kt": 1566950400,
        "TOA228_50kt": 1566950400,
        "TOD229_50kt": 1566950400,
        "TOD230_50kt": 1566950400
    },

    ]
}