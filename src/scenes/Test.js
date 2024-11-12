import Phaser from 'phaser';
class Test extends Phaser.Scene {
    constructor() {
        super({ key: 'Test' });
        this.candySize = 117.5;
        this.gridSize = 5;
        this.candies = [];
        this.selectedCandy = null;
        this.score = 0;
    }

    preload() {
        this.load.spritesheet('candies', 'assets/sprites/candy.jpeg', {
            frameWidth: this.candySize,
            frameHeight: this.candySize,
        });
        this.arrCandy = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
        ];
    }

    create() {
        this.createCandyGrid();
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', color: '#fff' });

        this.input.on('gameobjectdown', this.onCandyClicked, this);
    }

    createCandyGrid() {
        this.candies = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.candies[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const candyType = Phaser.Math.Between(0, 24);
                const candy = this.add.sprite(col * this.candySize, row * this.candySize, 'candies', candyType);
                candy.setInteractive();
                candy.candyType = candyType;
                candy.row = row;
                candy.col = col;
                this.candies[row][col] = candy;
            }
        }
    }
    onCandyClicked(pointer, candy) {
        if (!this.selectedCandy) {
            this.selectedCandy = candy;
        } else {
            this.swapCandies(this.selectedCandy, candy);
            this.selectedCandy = null;
        }
        console.log(this.candies);
    }

    swapCandies(candy1, candy2) {
        const tempCol = candy1.col;
        const tempRow = candy1.row;

        // Đổi vị trí
        candy1.col = candy2.col;
        candy1.row = candy2.row;
        candy2.col = tempCol;
        candy2.row = tempRow;

        // Cập nhật vị trí trên màn hình
        this.candies[candy1.row][candy1.col] = candy1;
        this.candies[candy2.row][candy2.col] = candy2;

        this.tweens.add({
            targets: candy1,
            x: candy1.col * this.candySize,
            y: candy1.row * this.candySize,
            duration: 300,
            onComplete: () => {
                this.checkMatches();
            },
        });

        this.tweens.add({
            targets: candy2,
            x: candy2.col * this.candySize,
            y: candy2.row * this.candySize,
            duration: 300,
        });
    }

    checkMatches() {
        let matches = this.findMatches();
        if (matches.length > 0) {
            this.handleMatches(matches);
        }
    }

    findMatches() {
        let matches = [];

        // Kiểm tra theo hàng ngang
        for (let row = 0; row < this.gridSize; row++) {
            let match = [];
            for (let col = 0; col < this.gridSize; col++) {
                if (match.length === 0 || this.candies[row][col].candyType === match[0].candyType) {
                    match.push(this.candies[row][col]);
                } else {
                    if (match.length >= 3) matches = matches.concat(match);
                    match = [this.candies[row][col]];
                }
            }
            if (match.length >= 3) matches = matches.concat(match);
        }

        // Kiểm tra theo hàng dọc
        for (let col = 0; col < this.gridSize; col++) {
            let match = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (match.length === 0 || this.candies[row][col].candyType === match[0].candyType) {
                    match.push(this.candies[row][col]);
                } else {
                    if (match.length >= 3) matches = matches.concat(match);
                    match = [this.candies[row][col]];
                }
            }
            if (match.length >= 3) matches = matches.concat(match);
        }

        return matches;
    }

    handleMatches(matches) {
        matches.forEach((candy) => {
            candy.destroy();
            this.candies[candy.row][candy.col] = null;
            this.updateScore(10);
        });
        this.refillCandies();
    }

    refillCandies() {
        for (let col = 0; col < this.gridSize; col++) {
            let emptySpaces = 0;
            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (this.candies[row][col] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    this.candies[row + emptySpaces][col] = this.candies[row][col];
                    this.candies[row + emptySpaces][col].row = row + emptySpaces;
                    this.candies[row][col] = null;

                    this.tweens.add({
                        targets: this.candies[row + emptySpaces][col],
                        y: (row + emptySpaces) * this.candySize,
                        duration: 300,
                    });
                }
            }
            for (let row = 0; row < emptySpaces; row++) {
                const candyType = Phaser.Math.Between(0, 4);
                const candy = this.add.sprite(col * this.candySize, row * this.candySize, 'candies', candyType);
                candy.setInteractive();
                candy.candyType = candyType;
                candy.row = row;
                candy.col = col;
                this.candies[row][col] = candy;

                this.tweens.add({
                    targets: candy,
                    y: candy.row * this.candySize,
                    duration: 300,
                });
            }
        }
        this.time.delayedCall(500, this.checkMatches, [], this);
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
    }
}

export default Test;
