/**
 * @file slidepage /
 * Created: 10.05.14 / 23:19
 */
var slidepage = makeObjInit({'slidesSelector': '.slides>section'}, {
    frameNumber: 0,
    frameHeight: null,
    latchCounter: 0,
    lastPos: 0,
    direction: 1,
    isReady: true,
    framesCollection: [],
    framesPosCollection: [],

    init: function () { var self = this; $(document).ready.call(this, function () {
        $(document).keydown(function (event) {
            switch (event.which) {
                case 38: // up
                    console.log('keyup scroll!');
                    self.onStepScroll(event, true, -1);
                    break;
                case 40: // down
                    console.log('keydown scroll!');
                    self.onStepScroll(event, true, +1);
                    break;
                default:
                    return; // exit this handler for other keys
            }
//                event.preventDefault(); // prevent the default action (scroll / move caret)
        });
        $(window).on('mousewheel DOMMouseScroll', function (event) {
            if (!(event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0)) {
                // scroll down
                self.onStepScroll(event, false, +1);
            } else {
                // scroll up
                self.onStepScroll(event, false, -1);
            }
        });

//        $(window).on('mousewheel', function (e) {
//            this.onStepScroll(e);
//        });

        self.framesCollection = [].slice.call($(self.slidesSelector));
        self.framesPosCollection = self.framesCollection.map(function(el){
            return $(el).offset();
        });
        self.frameHeight = $(window).height();
    }); },

    onStepScroll: function (e, isKeyboard, direct) {
        if (isKeyboard) {
            this.stepScroll(e, isKeyboard, direct);
            return;
        }
        if (this.latchCounter >= 1) {
            if (this.isReady) {
                this.stepScroll(e, isKeyboard, direct);
            }
        }
        else {
            if (this.isReady) {
                ++this.latchCounter;
                console.log('cnt:', this.latchCounter, 'diff:', $(window).scrollTop() - this.lastPos);
            } else {
                e.preventDefault();
            }
        }
    },

    stepScroll: function (e, isKeyboard, direct) {
        var self = this;
        console.log('scroll!');
        if (
            this.lastPos - $(window).scrollTop() != this.frameHeight
                && Math.abs(this.lastPos - $(window).scrollTop()) / this.frameHeight > 1.
            ) { // saved frame number is not correct
            console.log('obsolete:', this.frameNumber, this.lastPos);
            this.frameNumber = Math.floor($(window).scrollTop() / this.frameHeight);
            this.direction = ($(window).scrollTop() - this.lastPos) > 0 ? 1 : -1;
            this.frameNumber += this.direction;
            this.lastPos = $(window).scrollTop();
            console.log('corr.:', this.frameNumber, this.lastPos);
        }
        else {
            this.latchCounter = 0;
            this.isReady = false;
            //
            this.direction = (direct !== undefined) ? direct : ($(window).scrollTop() - this.lastPos) > 0 ? 1 : -1;
            this.frameNumber += this.direction;
            if (this.frameNumber < 0) {this.frameNumber = 0;}
            console.log(e, 'DY', this.direction, 'last:', this.lastPos, 'diff:', $(window).scrollTop() - this.lastPos, 'cnt:', this.frameNumber);
            $.scrollTo(this.posOfFrameNum(this.frameNumber), 500, {onAfter: function () {
                setTimeout(function () {
                    self.isReady = true;
                }, 100);
                self.lastPos = $(window).scrollTop();
            }});
        }
        e.preventDefault();
    },
    posOfFrameNum: function(frameNum) {
        return this.framesPosCollection[frameNum > 0 ? frameNum : 0].top;
    }

});
