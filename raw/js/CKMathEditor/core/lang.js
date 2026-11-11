CKEDITOR.lang = {
    languages: {
        af: 1,
        ar: 1,
        az: 1,
        bg: 1,
        bn: 1,
        bs: 1,
        ca: 1,
        cs: 1,
        cy: 1,
        da: 1,
        de: 1,
        "de-ch": 1,
        el: 1,
        "en-au": 1,
        "en-bz": 1,
        "en-ca": 1,
        "en-cb": 1,
        "en-gb": 1,
        "en-ie": 1,
        "en-in": 1,
        "en-jm": 1,
        "en-my": 1,
        "en-nz": 1,
        "en-ph": 1,
        "en-tt": 1,
        "en-uk": 1,
        "en-us": 1,
        "en-za": 1,
        "en-zw": 1,
        en: 1,
        eo: 1,
        es: 1,
        "es-mx": 1,
        et: 1,
        eu: 1,
        fa: 1,
        fi: 1,
        fo: 1,
        "fr-ca": 1,
        fr: 1,
        gl: 1,
        gu: 1,
        he: 1,
        hi: 1,
        hr: 1,
        hu: 1,
        id: 1,
        is: 1,
        it: 1,
        ja: 1,
        ka: 1,
        km: 1,
        ko: 1,
        ku: 1,
        lt: 1,
        lv: 1,
        mk: 1,
        mn: 1,
        ms: 1,
        nb: 1,
        nl: 1,
        no: 1,
        oc: 1,
        pl: 1,
        "pt-br": 1,
        pt: 1,
        ro: 1,
        ru: 1,
        si: 1,
        sk: 1,
        sl: 1,
        sq: 1,
        "sr-latn": 1,
        sr: 1,
        sv: 1,
        th: 1,
        tr: 1,
        tt: 1,
        ug: 1,
        uk: 1,
        vi: 1,
        "zh-cn": 1,
        zh: 1
    },
    rtl: {
        ar: 1,
        fa: 1,
        he: 1,
        ku: 1,
        ug: 1
    },
    load: function(a, t, n) {
        a && CKEDITOR.lang.languages[a] || (a = this.detect(t, a));
        if(this[t]==undefined) this["en"]=CKEDITOR.lang.en;
        if(a=="en-us" || a=="en-uk" || a=="en-gb"){
            a="en";
        }
        var e = this,
            r = function() {
                e[a] != undefined ? (e[a].dir = e.rtl[a] ? "rtl" : "ltr") : "ltr", n(a, e[a])
            };
        this[a] ? r() : CKEDITOR.scriptLoader.load(CKEDITOR.getUrl("lang/" + a + ".js"), r, this)
    },
    detect: function(a, t) {
        var n = this.languages,
            e = (t = t || navigator.userLanguage || navigator.language || a).toLowerCase().match(/([a-z]+)(?:-([a-z]+))?/),
            r = e[1],
            l = e[2];
        return n[r + "-" + l] ? r = r + "-" + l : n[r] || (r = null), CKEDITOR.lang.detect = r ? function() {
            return r
        } : function(a) {
            return a
        }, r || a
    }
};