/* UTTERANCES
While the built-in facilities for creating sound-effects are impressively flexible,
they are insufficient to properly express moods and emotions.
For the Emote extension, we would like to create more complex sounds, that have 
inflections in both pitch and volume.  We call these sound-patterns "utterances".
Examples include a laugh, a moan or an "Uh-oh" that indicates a problem.
These can involve up to three separate sound parts that will then be played consecutively
to give a smoothly varying result when spliced together.

Internally, sound effects are encoded as a string of 72 digits, broken into several fields
(many of which appear to be obsolete or redundant). 
The function createSoundEffect() takes eight arguments and works hard to encode them into their
respective fields.

We would like to be able to dynamically vary the overall pitch or volume of any given utterance.
Conventionally, that would require reconstructing all three sound effects from scratch for each 
performance (or saving a wide range of 3*72-character strings we prepared earlier).
Instead we choose to selectively overwrite certain 4-digit fields within our three-part 
utterance to "tune" its pitch and volume as we require.

*** It is acknowledged that this is a DANGEROUS PRACTICE that relies on the internal
*** representation not changing, but it is believed that the performance gains justify it!

*/

//% color=33 weight=100 icon="\uf600 block="Utter"
namespace Vocalise {
    // we provide an array of 10 built-in utterances, accesssed by enumerated index
    enum VoxType {
        //% block="Tweet"
        TWEET,
        //% block="Laugh"
        LAUGH,
        //% block="Snore"
        SNORE,
        //% block="Doo"
        DOO,
        //% block="Eh?"
        QUERY,
        //% block="Uh-oh"
        UHOH,
        //% block="Moan"
        MOAN,
        //% block="Duh!"
        DUH,
        //% block="Waah"
        WAAH,
        //% block="Growl"
        GROWL
    }

    enum PartUse {
        UNUSED = 0,
        PLAYED = 1,
        SILENT = 2
    }
    // provide activity events (for other components to synchronise with)
    const VOCALISE_ACTIVITY_ID = 1234 // TODO: Check this a is permissable value!
    enum Action {
        START = 1,
        FINISH = 2
    }

    // Code this defensively, just in case SoundExpression field-locations should change in future.
    // (We presume their values will always be 0000 to 9999)
    const startVolPos = 1
    const startFreqPos = 5
    const durationPos = 9
    const endVolPos = 26
    const endFreqPos = 18


    //====================================================================
    class Utterance {
        // properties
        myType: VoxType;
        partA: soundExpression.Sound;
        partB: soundExpression.Sound;
        partC: soundExpression.Sound;
        useOfA: PartUse;
        useOfB: PartUse;
        useOfC: PartUse;
        // Each part has a start and an end [frequency,volume], but endA===startB 
        // and endB===startC, so an utterance moves through four [frequency,volume] points
        // These are set up to be fixed ratios of the performance [frequency,volume]
        // 
        freqRatio0: number;
        freqRatio1: number;
        freqRatio2: number;
        freqRatio3: number;
        volRatio0: number;
        volRatio1: number;
        volRatio2: number;
        volRatio3: number;
        // Proportions of time allocated to each part
        timeRatio1: number;
        timeRatio2: number;
        timeRatio3: number;

        // initially create all sounds arbitrarily with freq=333Hz, vol=666, ms=999 (333ms  each)
        constructor(me: VoxType) {
            this.myType = me;
            // until otherwise instructed...
            this.useOfA = PartUse.UNUSED;
            this.useOfB = PartUse.UNUSED;
            this.useOfC = PartUse.UNUSED;
        }

        // methods...  
        // Sets up Part A, implicitly setting start values for Part B
        usePartA(freq0: number, vol0: number, wave: WaveShape, fx: SoundExpressionEffect, shape: InterpolationCurve, freq1: number, vol1: number, ms1: number) {
            this.freqRatio0 = freq0;
            this.volRatio0 = vol0;
            this.freqRatio1 = freq1;
            this.volRatio1 = vol1;
            this.timeRatio1 = ms1;
            this.partA = new soundExpression.Sound;
            this.partA.src = music.createSoundEffect(wave, 333, 333, 666, 666, 999, fx, shape);
            this.useOfA = PartUse.PLAYED
        }
        // Adds an optional Part B, implicitly setting start values for Part C
        usePartB(wave: WaveShape, fx: SoundExpressionEffect, shape: InterpolationCurve, freq2: number, vol2: number, ms2: number) {
            // we have a PartB...
            this.freqRatio2 = freq2;
            this.volRatio2 = vol2;
            this.timeRatio2 = ms2;
            this.partB = new soundExpression.Sound;
            this.partB.src = music.createSoundEffect(wave, 333, 333, 666, 666, 999, fx, shape);
            this.useOfB = PartUse.PLAYED
        }
        // Adds a silent Part B, but still sets the start values for Part C
        silentPartB(freq2: number, vol2: number, ms2: number) {
            this.freqRatio2 = freq2;
            this.volRatio2 = vol2;
            this.timeRatio2 = ms2;
            this.useOfB = PartUse.SILENT
        }
        // Adds an optional part C,
        usePartC(wave: WaveShape, fx: SoundExpressionEffect, shape: InterpolationCurve, freq3: number, vol3: number, ms3: number) {
            // we have a PartC as well...
            this.freqRatio3 = freq3;
            this.volRatio3 = vol3;
            this.timeRatio3 = ms3;
            this.partC = new soundExpression.Sound;
            this.partC.src = music.createSoundEffect(wave, 333, 333, 666, 666, 999, fx, shape);
            this.useOfC = PartUse.PLAYED
        }

        performUsing(freq: number, vol: number, ms: number) {
            let loudness = vol * 4 // map from [0...255] into range [0...1023]
            // adjust PartA duration, frequencies and volumes 
            this.partA.src = this.insert(this.partA.src, durationPos, this.formatNumber(ms * this.timeRatio1, 4));
            this.partA.src = this.insert(this.partA.src, startFreqPos, this.formatNumber(freq * this.freqRatio0, 4));
            this.partA.src = this.insert(this.partA.src, startVolPos, this.formatNumber(loudness * this.volRatio0, 4));
            let nextFreqStr = this.formatNumber(freq * this.freqRatio1, 4);
            let nextVolStr = this.formatNumber(loudness * this.volRatio1, 4);
            this.partA.src = this.insert(this.partA.src, endFreqPos, nextFreqStr);
            this.partA.src = this.insert(this.partA.src, endVolPos, nextVolStr);

            if (this.useOfB == PartUse.PLAYED) {
                // adjust PartB duration, frequencies and volumes
                this.partB.src = this.insert(this.partB.src, durationPos, this.formatNumber(ms * this.timeRatio2, 4));
                this.partB.src = this.insert(this.partB.src, startFreqPos, nextFreqStr);
                this.partB.src = this.insert(this.partB.src, startVolPos, nextVolStr);
                nextFreqStr = this.formatNumber(freq * this.freqRatio2, 4);
                nextVolStr = this.formatNumber(loudness * this.volRatio2, 4);
                this.partB.src = this.insert(this.partB.src, endFreqPos, nextFreqStr);
                this.partB.src = this.insert(this.partB.src, endVolPos, nextVolStr);
            }
            if (this.useOfC == PartUse.PLAYED) {
                // adjust PartC duration, frequencies and volumes
                this.partC.src = this.insert(this.partC.src, durationPos, this.formatNumber(ms * this.timeRatio3, 4));
                this.partC.src = this.insert(this.partC.src, startFreqPos, nextFreqStr);
                this.partC.src = this.insert(this.partC.src, startVolPos, nextVolStr);
                this.partC.src = this.insert(this.partC.src, endFreqPos, this.formatNumber(freq * this.freqRatio3, 4));
                this.partC.src = this.insert(this.partC.src, endVolPos, this.formatNumber(loudness * this.volRatio3, 4));

            }

            // now for the actual performance...
            control.raiseEvent(VOCALISE_ACTIVITY_ID, Action.START) // ..typically, to open mouth
            music.playSoundEffect(this.partA.src, SoundExpressionPlayMode.UntilDone);
            if (this.useOfB == PartUse.PLAYED) {
                music.playSoundEffect(this.partB.src, SoundExpressionPlayMode.UntilDone);
            }
            if (this.useOfB == PartUse.SILENT) {
                basic.pause(ms * this.timeRatio2)
            }
            if (this.useOfC == PartUse.PLAYED) {
                music.playSoundEffect(this.partC.src, SoundExpressionPlayMode.UntilDone);
            }
            control.raiseEvent(VOCALISE_ACTIVITY_ID, Action.FINISH) // ..typically, to close mouth
        }
        // internal tools...
        protected formatNumber(num: number, length: number) {
            let result = Math.constrain(num | 0, 0, Math.pow(10, length) - 1) + "";
            while (result.length < length) result = "0" + result;
            return result;
        }
        protected insert(expression: string, offset: number, digits: string): string {
            return expression.substr(0, offset) + digits + expression.substr(offset + digits.length);
        }

    }


    // now create a selection of standard utterances
    const utterances = [
        new Utterance(VoxType.TWEET),
        new Utterance(VoxType.LAUGH),
        new Utterance(VoxType.SNORE),
        new Utterance(VoxType.DOO),
        new Utterance(VoxType.QUERY),
        new Utterance(VoxType.UHOH),
        new Utterance(VoxType.MOAN),
        new Utterance(VoxType.DUH),
        new Utterance(VoxType.WAAH),
        new Utterance(VoxType.GROWL)
    ]

    /*
       Short-hand definitions are laid out as follows:
       <name>             <%Freq,vol>          at start of PartA
       <PartA wave-style> <%Freq,vol,%time>    at end of PartA & start of PartB
       <PartB wave-style> <%Freq,vol,%time>    at end of PartB & start of PartC
       <PartC wave-style> <%Freq,vol,%time>    at end of PartC
       */
    /*
    TWEET         80% 120
    SIN NONE LOG 100% 200 90%
    SILENT                10%
    */
    utterances[VoxType.TWEET].usePartA(0.8, 120, WaveShape.Sine, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 200, 0.9);
    utterances[VoxType.TWEET].silentPartB(0.0, 0, 0.1)

    /*
    LAUGH         70% 100
    SAW NONE LOG 100% 255 90%
    SQU NONE LIN  70% 180 10%
    */
    utterances[VoxType.LAUGH].usePartA(0.70, 100, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 255, 0.9)
    utterances[VoxType.LAUGH].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.7, 180, 0.1);

    /*
    SNORE       3508  27
    NOI VIB LIN  715 255 50%
    NOI VIB LIN 5008  0 50%
    NOTE: The noise-generator is highly sensitive to the chosen frequency-trajectory, and these strange values have been experimentally derived.
    By always invoking Snore.performUsing() with freq=1, these literal frequencies will get used verbatim!
    */
    utterances[VoxType.SNORE].usePartA(3508, 27, WaveShape.Noise, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear, 715, 255, 0.50)
    utterances[VoxType.SNORE].usePartB(WaveShape.Noise, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear, 5008, 0, 0.50);

    /*
    DOO          300% 200
    SAW NONE LOG 100% 220  5%
    SQU NONE LIN 100% 180 95%
    */
    utterances[VoxType.DOO].usePartA(3.00, 200, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 220, 0.05)
    utterances[VoxType.DOO].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.00, 180, 0.95);

    /*
    QUERY        110%  50
    SQU NONE LIN 100% 255 20%
    SQU NONE CUR 150%  50 80%
    */
    utterances[VoxType.QUERY].usePartA(1.10, 50, WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.00, 255, 0.2)
    utterances[VoxType.QUERY].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.50, 50, 0.8);

    /*
    UHOH         110% 100
    SAW NONE LOG 140% 255 25%
    SILENT       110% 255 20%
    SQU NONE LIN 100% 180 55%
    */
    utterances[VoxType.UHOH].usePartA(1.10, 100, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.40, 255, 0.25)
    utterances[VoxType.UHOH].silentPartB(1.10, 255, 0.2)
    utterances[VoxType.UHOH].usePartC(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.00, 180, 0.55);

    /*
    MOAN         130% 150
    TRI NONE CUR 100% 250 30%
    TRI NONE CUR  95% 200 60%
    TRI NONE LIN 115% 133 10%
    */
    utterances[VoxType.MOAN].usePartA(1.30, 150, WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.00, 250, 0.3)
    utterances[VoxType.MOAN].usePartB(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve, 0.95, 200, 0.6)
    utterances[VoxType.MOAN].usePartC(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.15, 133, 0.1);

    /*
    DUH          100% 150
    SQU NONE LIN  95% 200 10%
    SQU NONE LIN 110% 250 30%
    SQU NONE LIN  66%  90 60%
    */
    utterances[VoxType.DUH].usePartA(1.00, 150, WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.95, 200, 0.1)
    utterances[VoxType.DUH].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.10, 250, 0.3)
    utterances[VoxType.DUH].usePartC(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.66, 90, 0.6);

    /*
    WAAH         100%  25
    SAW NONE CUR 140% 255 20%
    SAW NONE LIN 110%  50 70%
    SAW NONE LIN  30%  10 10%
    */
    utterances[VoxType.WAAH].usePartA(1.00, 25, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.40, 255, 0.20)
    utterances[VoxType.WAAH].usePartB(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.10, 50, 0.70)
    utterances[VoxType.WAAH].usePartC(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.3, 10, 0.10);

    /*
    GROWL         30% 120
    SAW NONE LOG 100% 200 15%
    SAW NONE LIN  90% 255 60%
    SAW NONE LIN  30% 180 15%
    */
    utterances[VoxType.GROWL].usePartA(0.30, 120, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 200, 0.15)
    utterances[VoxType.GROWL].usePartB(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.90, 255, 0.60)
    utterances[VoxType.GROWL].usePartC(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.30, 180, 0.15);


    //% block="emit $utterance at pitch $pitch with strength $strength for $duration ms"
    //% inlineInputMode=inline   
    //% pitch.min=100 pitch.max=800 pitch.defl=300
    //% strength.min=0 strength.max=255 strength.defl=180
    //% duration.min=50 duration.max=9999 duration.defl=1000
    export function emit(utterance: VoxType, pitch: number, strength: number, duration: number) {
        utterances[utterance].performUsing(pitch, strength, duration);
    }

    //% block="hum || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=10
    //% strength.min=0 strength.max=255 strength.defl=180
    //% duration.min=1 duration.max= 100 duration.defl=2000
    export function hum(repeat: number = 10, strength: number = 180, duration: number = 2000) {
        quiet = false
        ave = duration / repeat
        pitch = randint(200, 350)
        let skip = true
        for (let index = 0; index < repeat; index++) {
            span = randint(0.2 * ave, 1.8 * ave)
            if ((span > 0.6 * ave) || (skip)) {
                // mostly "Dum"...
                emit(VoxType.DOO, randint(150, 300), strength, span)
                basic.pause(100)
                skip = false
            } else {
                // .. with occasional short, higher-pitched "Di"
                emit(VoxType.DOO, randint(350, 500), strength, 0.25 * ave)
                basic.pause(50)
                skip = true
            }
        }
        quiet = true
    }

    //% block="grumble || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=5
    //% strength.min=0 strength.max=255 strength.defl=250
    //% duration.min=1 duration.max= 100 duration.defl=3000
    export function grumble(repeat: number=5, strength: number=250, duration: number=3000) {
        quiet = false
        ave = duration / repeat
        basic.showIcon(IconNames.Sad)
        for (let index = 0; index < repeat; index++) {
            span = randint(0.4 * ave, 1.8 * ave)
            if (span > 1.0 * ave) {
                emit(VoxType.DUH, randint(150, 300), strength, 0.5 * span)
            } else {
                emit(VoxType.UHOH, randint(100, 200), strength, 2 * span)
            }
            pause(0.5 * span)
        }
        quiet = true
    }

    //% block="giggle || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=12
    //% strength.min=0 strength.max=255 strength.defl=200
    //% duration.min=1 duration.max= 100 duration.defl=4000
    export function giggle(repeat: number=12, strength: number=200, duration: number=4000) {
        quiet = false
        ave = duration / repeat
        pitch = randint(500, 700)
        for (let index = 0; index < repeat; index++) {
            span = randint(0.4 * ave, 1.8 * ave)
            emit(VoxType.LAUGH, pitch, strength, span)
            pitch = 0.9 * pitch
            basic.pause(100)
        }
        quiet = true
    }

    //% block="whistle || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=8
    //% strength.min=0 strength.max=255 strength.defl=180
    //% duration.min=1 duration.max= 100 duration.defl=2500
    export function whistle(repeat: number=8, strength: number=180, duration: number=2500) {
        quiet = false
        ave = duration / repeat
        for (let index = 0; index < repeat; index++) {
            span = randint(0.4 * ave, 1.8 * ave)
            emit(VoxType.TWEET, randint(600, 1200), strength, span)
            basic.pause(100)
        }
        quiet = true
    }

    //% block="snore || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=8
    //% strength.min=0 strength.max=255 strength.defl=150
    //% duration.min=1 duration.max= 100 duration.defl=5000
    export function snore(repeat: number=8, strength: number=150, duration: number=5000) {
        quiet = false
        ave = duration / repeat
        for (let index = 0; index < repeat; index++) {
            span = randint(0.9 * ave, 1.1 * ave)
            emit(VoxType.SNORE, 1, 80, 0.3 * span);
            pause(300);
            emit(VoxType.SNORE, 1, 150, 0.7 * span);
            pause(500);
        }
        quiet = true
    }

    //% block="whimper || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=10
    //% strength.min=0 strength.max=255 strength.defl=100
    //% duration.min=1 duration.max= 100 duration.defl=4000
    export function whimper(repeat: number=10, strength: number=100, duration: number=4000) {
        if (quiet) {
            quiet = false
            ave = duration / repeat
            for (let index = 0; index < repeat; index++) {
                emit(VoxType.MOAN, randint(250, 400), strength, randint(0.7 * ave, 1.3 * ave))
                basic.pause(300)
            }
            quiet = true
        }
    }

    //% block="cry || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=8
    //% strength.min=0 strength.max=255 strength.defl=200
    //% duration.min=1 duration.max= 100 duration.defl=3000
    export function cry(repeat: number=8, strength: number=200, duration: number=3000) {
        if (quiet) {
            quiet = false
            ave = duration / repeat
            for (let index = 0; index < repeat; index++) {
                span = randint(0.4 * ave, 1.8 * ave)
                if (span > 0.9 * ave) {
                    emit(VoxType.MOAN, randint(200, 350), 1.5 * strength, 0.5 * span)
                } else {
                    emit(VoxType.WAAH, randint(250, 400), 0.1 * strength, 1.3 * span)
                }
                basic.pause(300)
            }
            quiet = true
        }
    }

    //% block="shout || $repeat times with strength $strength over $duration ms"
    //% expandableArgumentMode="toggle"
    //% repeat.min=1 repeat.max=100 repeat.defl=5
    //% strength.min=0 strength.max=255 strength.defl=250
    //% duration.min=1 duration.max= 100 duration.defl=2500
    export function shout(repeat: number=5, strength: number=250, duration: number=2500) {
        if (quiet) {
            quiet = false
            ave = duration / repeat
            for (let index = 0; index < repeat; index++) {
                emit(VoxType.GROWL, randint(250, 400), strength, randint(0.4 * ave, 1.8 * ave))
                basic.pause(200)
            }
            quiet = true
        }

    }
}

input.onButtonPressed(Button.A, function () {
    if (quiet) {
        Vocalise.whistle(15, 200, 3000)
    }
})


input.onButtonPressed(Button.B, function () {
    if (quiet) {
        Vocalise.hum(10, 180, 3000)
    }
})

input.onPinPressed(TouchPin.P1, function () {
    if (quiet) {
        Vocalise.grumble(10, 200, 10000);
    }
})

input.onPinPressed(TouchPin.P2, function () {
    if (quiet) {
        Vocalise.snore(10, 150, 10000)
    }
})

input.onGesture(Gesture.Shake, function () {
    if (quiet) {
        Vocalise.giggle(7, 250, 800);
    }
})

input.onGesture(Gesture.ScreenDown, function () {
    if (quiet) {
        Vocalise.cry(10, 100, 10000);
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (quiet) {
        Vocalise.shout(10, 200, 5000);
    }
})

let quiet = true
let span = 0
let pitch = 0
let ave = 0
music.setBuiltInSpeakerEnabled(false)
pins.touchSetMode(TouchTarget.P1, TouchTargetMode.Capacitive)
pins.touchSetMode(TouchTarget.P2, TouchTargetMode.Capacitive)
