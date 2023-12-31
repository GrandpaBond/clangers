/* FlexFX
While the built-in facilities for creating sound-effects are impressively flexible,
they are insufficient for the Emote extension to properly express moods and emotions.
We would like to create more complex sounds, that have inflections in both pitch and volume.
Examples include a laugh, a moan or an "Uh-oh" that indicates a problem.

To achieve this we have defined a flexible sound-effect class called a "FlexFX".
It can involve up to three separate sound parts that will then be played consecutively
to give a smoothly varying result when spliced together.

Internally, sound effects are encoded as a string of 72 digits, broken into several fields
(many of which appear to be obsolete or redundant). 
The function createSoundEffect() takes eight arguments and works hard to encode them into their
respective fields.

We would like to be able to dynamically vary the overall pitch or volume of any given FlexFX.
Conventionally, that would require reconstructing all three sound effects from scratch for each 
performance (or saving a wide range of 3*72-character strings we prepared earlier).
Instead we choose to selectively overwrite certain 4-digit fields within our three-part 
FlexFX to "tune" its pitch and volume as we require.

*** It is acknowledged that this is a DANGEROUS PRACTICE that relies on the internal
*** representation not changing, but it is believed that the performance gains justify it!

*/

// for Emote, we provide an array of 10 FlexFXs, accesssed by these enumerated index:
enum MoodSound {
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


//% color=33 weight=100 icon="\uf06a" block="Vocalise"
namespace Vocalise {
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
    // (We presume their values will never exceed 4 digits)
    const startVolPos = 1
    const startFreqPos = 5
    const durationPos = 9
    const endVolPos = 26
    const endFreqPos = 18


    //====================================================================
    class FlexFX {
        // properties
        myType: MoodSound;
        partA: soundExpression.Sound;
        partB: soundExpression.Sound;
        partC: soundExpression.Sound;
        useOfA: PartUse;
        useOfB: PartUse;
        useOfC: PartUse;
        // Each part has a start and an end [frequency,volume], but endA===startB 
        // and endB===startC, so an FlexFX moves through four [frequency,volume] points
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

        constructor(me: MoodSound) {
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


    // now create our collection of built-in FlexFX objects
    const FxList = [
        new FlexFX(MoodSound.TWEET),
        new FlexFX(MoodSound.LAUGH),
        new FlexFX(MoodSound.SNORE),
        new FlexFX(MoodSound.DOO),
        new FlexFX(MoodSound.QUERY),
        new FlexFX(MoodSound.UHOH),
        new FlexFX(MoodSound.MOAN),
        new FlexFX(MoodSound.DUH),
        new FlexFX(MoodSound.WAAH),
        new FlexFX(MoodSound.GROWL)
    ]

    /*
       Short-hand definitions are laid out as follows:
       <name>             <%Freq,%vol>          at start of PartA
       <PartA wave-style> <%Freq,%vol,%time>    at end of PartA & start of PartB
       <PartB wave-style> <%Freq,%vol,%time>    at end of PartB & start of PartC
       <PartC wave-style> <%Freq,%vol,%time>    at end of PartC
       */
    /*
    TWEET         80% 45%
    SIN NONE LOG 100% 80% 90%
    SILENT                10%
    */
    FxList[MoodSound.TWEET].usePartA(0.8, 0.45, WaveShape.Sine, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 0.8, 0.9);
    FxList[MoodSound.TWEET].silentPartB(0.0, 0, 0.1)

    /*
    LAUGH         70%  40%
    SAW NONE LOG 100% 100% 90%
    SQU NONE LIN  70%  75% 10%
    */
    FxList[MoodSound.LAUGH].usePartA(0.70, 0.4, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 1.0, 0.9)
    FxList[MoodSound.LAUGH].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.7, 0.75, 0.1);

    /*
    SNORE       3508  10%
    NOI VIB LIN  715 100% 50%
    NOI VIB LIN 5008   0% 50%
    NOTE: The noise-generator is highly sensitive to the chosen frequency-trajectory, and these strange values have been experimentally derived.
    By always invoking Snore.performUsing() with the scaling-factor freq=1, these literal frequencies will get used verbatim!
    */
    FxList[MoodSound.SNORE].usePartA(3508, 0.1, WaveShape.Noise, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear, 715, 1.0, 0.50)
    FxList[MoodSound.SNORE].usePartB(WaveShape.Noise, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear, 5008, 0, 0.50);

    /*
    DOO          300% 80%
    SAW NONE LOG 100% 90%  5%
    SQU NONE LIN 100% 70% 95%
    */
    FxList[MoodSound.DOO].usePartA(3.00, 0.8, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 0.9, 0.05)
    FxList[MoodSound.DOO].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.00, 0.7, 0.95);

    /*
    QUERY        110%  20%
    SQU NONE LIN 100% 100% 20%
    SQU NONE CUR 150%  20% 80%
    */
    FxList[MoodSound.QUERY].usePartA(1.10, 0.2, WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.00, 1.0, 0.2)
    FxList[MoodSound.QUERY].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.50, 0.2, 0.8);

    /*
    UHOH         110%  40%
    SAW NONE LOG 140% 100% 25%
    SILENT       110% 100% 20%
    SQU NONE LIN 100%  75% 55%
    */
    FxList[MoodSound.UHOH].usePartA(1.10, 0.4, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.40, 1.0, 0.25)
    FxList[MoodSound.UHOH].silentPartB(1.10, 1.0, 0.2)
    FxList[MoodSound.UHOH].usePartC(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.00, 0.75, 0.55);

    /*
    MOAN         130%  60%
    TRI NONE CUR 100% 100% 30%
    TRI NONE CUR  95%  80% 60%
    TRI NONE LIN 115%  55% 10%
    */
    FxList[MoodSound.MOAN].usePartA(1.30, 0.6, WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.00, 1.0, 0.3)
    FxList[MoodSound.MOAN].usePartB(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Curve, 0.95, 0.8, 0.6)
    FxList[MoodSound.MOAN].usePartC(WaveShape.Triangle, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.15, 0.55, 0.1);

    /*
    DUH          100%  60%
    SQU NONE LIN  95%  80% 10%
    SQU NONE LIN 110% 100% 30%
    SQU NONE LIN  66%  40% 60%
    */
    FxList[MoodSound.DUH].usePartA(1.00, 0.6, WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.95, 0.8, 0.1)
    FxList[MoodSound.DUH].usePartB(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.10, 1.0, 0.3)
    FxList[MoodSound.DUH].usePartC(WaveShape.Square, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.66, 0.4, 0.6);

    /*
    WAAH         100% 10%
    SAW NONE CUR 140% 90% 20%
    SAW NONE LIN 110% 20% 70%
    SAW NONE LIN  30%  5% 10%
    */
    FxList[MoodSound.WAAH].usePartA(1.00, 0.1, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Curve, 1.40, 0.9, 0.20)
    FxList[MoodSound.WAAH].usePartB(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 1.10, 0.2, 0.70)
    FxList[MoodSound.WAAH].usePartC(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.3, 0.05, 0.10);

    /*
    GROWL         30%  50%
    SAW NONE LOG 100%  80% 15%
    SAW NONE LIN  90% 100% 60%
    SAW NONE LIN  30%  75% 15%
    */
    FxList[MoodSound.GROWL].usePartA(0.30, 0.5, WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Logarithmic, 1.00, 0.8, 0.15)
    FxList[MoodSound.GROWL].usePartB(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.90, 1.0, 0.60)
    FxList[MoodSound.GROWL].usePartC(WaveShape.Sawtooth, SoundExpressionEffect.None, InterpolationCurve.Linear, 0.30, 0.75, 0.15);


    //% block="emit $FlexFX at pitch $pitch with strength $strength for $duration ms"
    //% inlineInputMode=inline  
    //% advanced=true 
    //% pitch.min=100 pitch.max=800 pitch.defl=300
    //% strength.min=0 strength.max=255 strength.defl=180
    //% duration.min=50 duration.max=9999 duration.defl=1000
    export function emit(FlexFX: MoodSound, pitch: number, strength: number, duration: number) {
        FxList[FlexFX].performUsing(pitch, strength, duration);
    }

// ******************* SIMPLE RANDOM INVOCATION BLOCKS ******************

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
                emit(MoodSound.DOO, randint(150, 300), strength, span)
                basic.pause(100)
                skip = false
            } else {
                // .. with occasional short, higher-pitched "Di"
                emit(MoodSound.DOO, randint(350, 500), strength, 0.25 * ave)
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
    export function grumble(repeat: number = 5, strength: number = 250, duration: number = 3000) {
        quiet = false
        ave = duration / repeat
        basic.showIcon(IconNames.Sad)
        for (let index = 0; index < repeat; index++) {
            span = randint(0.4 * ave, 1.8 * ave)
            if (span > 1.0 * ave) {
                emit(MoodSound.DUH, randint(150, 300), strength, 0.5 * span)
            } else {
                emit(MoodSound.UHOH, randint(100, 200), strength, 2 * span)
            }
            pause(0.5 * span)
        }
        quiet = true
    }

    //% block="giggle || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=12
    //% strength.min=0 strength.max=255 strength.defl=200
    //% duration.min=1 duration.max= 100 duration.defl=4000
    export function giggle(repeat: number = 12, strength: number = 200, duration: number = 2000) {
        quiet = false
        ave = duration / repeat
        pitch = randint(500, 700)
        for (let index = 0; index < repeat; index++) {
            span = randint(0.4 * ave, 1.8 * ave)
            emit(MoodSound.LAUGH, pitch, strength, span)
            pitch = 0.9 * pitch
            basic.pause(100)
        }
        quiet = true
    }

    //% block="whistle || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=8
    //% strength.min=0 strength.max=255 strength.defl=180
    //% duration.min=1 duration.max= 100 duration.defl=2500
    export function whistle(repeat: number = 8, strength: number = 180, duration: number = 2500) {
        quiet = false
        ave = duration / repeat
        for (let index = 0; index < repeat; index++) {
            span = randint(0.4 * ave, 1.8 * ave)
            emit(MoodSound.TWEET, randint(600, 1200), strength, span)
            basic.pause(100)
        }
        quiet = true
    }

    //% block="snore || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=8
    //% strength.min=0 strength.max=255 strength.defl=150
    //% duration.min=1 duration.max= 100 duration.defl=5000
    export function snore(repeat: number = 8, strength: number = 150, duration: number = 5000) {
        quiet = false
        ave = duration / repeat
        for (let index = 0; index < repeat; index++) {
            span = randint(0.9 * ave, 1.1 * ave)
            emit(MoodSound.SNORE, 1, 80, 0.3 * span);
            pause(300);
            emit(MoodSound.SNORE, 1, 150, 0.7 * span);
            pause(500);
        }
        quiet = true
    }

    //% block="whimper || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=10
    //% strength.min=0 strength.max=255 strength.defl=100
    //% duration.min=1 duration.max= 100 duration.defl=4000
    export function whimper(repeat: number = 10, strength: number = 100, duration: number = 4000) {
        if (quiet) {
            quiet = false
            ave = duration / repeat
            for (let index = 0; index < repeat; index++) {
                emit(MoodSound.MOAN, randint(250, 400), strength, randint(0.7 * ave, 1.3 * ave))
                basic.pause(300)
            }
            quiet = true
        }
    }

    //% block="cry || $repeat times with strength $strength over $duration ms"
    //% repeat.min=1 repeat.max=100 repeat.defl=8
    //% strength.min=0 strength.max=255 strength.defl=200
    //% duration.min=1 duration.max= 100 duration.defl=3000
    export function cry(repeat: number = 8, strength: number = 200, duration: number = 3500) {
        if (quiet) {
            quiet = false
            ave = duration / repeat
            for (let index = 0; index < repeat; index++) {
                span = randint(0.6 * ave, 1.5 * ave)
                if (span > 0.9 * ave) {
                    emit(MoodSound.MOAN, randint(200, 350), 1.5 * strength, 0.5 * span)
                } else {
                    emit(MoodSound.WAAH, randint(250, 400), 0.05 * strength, 1.3 * span)
                }
                basic.pause(200)
            }
            quiet = true
        }
    }

    //% block="shout || $repeat times with strength $strength over $duration ms"
    //% expandableArgumentMode="toggle"
    //% repeat.min=1 repeat.max=100 repeat.defl=5
    //% strength.min=0 strength.max=255 strength.defl=250
    //% duration.min=1 duration.max= 100 duration.defl=2500
    export function shout(repeat: number = 5, strength: number = 250, duration: number = 2500) {
        if (quiet) {
            quiet = false
            ave = duration / repeat
            for (let index = 0; index < repeat; index++) {
                emit(MoodSound.GROWL, randint(320, 400), strength, randint(0.8 * ave, 1.2 * ave))
                basic.pause(300)
            }
            quiet = true
        }

    }
}

// *********** test codes **********

function doSound(choice: number) {
    switch (choice) {
        case 1: Vocalise.shout();
            break;
        case 2: Vocalise.cry();
            break;
        case 3: Vocalise.whimper();
            break;
        case 4: Vocalise.snore();
            break;
        case 5: Vocalise.whistle();
            break;
        case 6: Vocalise.giggle();
            break;
        case 7: Vocalise.grumble();
            break;
        case 8: Vocalise.hum()
    }
    basic.pause(1000)
}

let quiet = true
let span = 0
let pitch = 0
let ave = 0
let choice = 7
music.setBuiltInSpeakerEnabled(false)

input.onButtonPressed(Button.A, function () {
    choice = (++choice) % 8;
    basic.showNumber(choice+1);
})
input.onButtonPressed(Button.B, function () {
    doSound(choice + 1);
})
