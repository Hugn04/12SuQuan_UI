class Broad extends Phaser.GameObjects.Container {
    static candySize = 117.5; // Chuyển candySize thành thuộc tính static

    constructor(config) {
        super(config.scene, config.x, config.y);
        config.scene.add.existing(this);
        this.socket = config.socket;
        this.isMyTurn = true;
        if (this.socket) {
            this.handleServer();
            this.arrBroad = config.initBoard.current;
            this.arrTemp = config.initBoard.temp;
        } else {
            this.arrBroad = config.initBoard;
        }
        this.candyRandom = 0;
        this.temp = [];
        this.gridSize = { y: this.arrBroad.length, x: this.arrBroad[0].length };
        this.candies = [...this.arrBroad];
        this.selectedCandy = null;
        this.score = 0;
        this.candyScale = 0.7;
        this.candySize = Broad.candySize * this.candyScale;
        this.smoot = 400;
        this.numRow = this.arrBroad.length / 2;

        this.isAnimation = false;
        this.arrBroad.forEach((itemRow, row) => {
            itemRow.forEach((type, col) => {
                const candy = this.scene.add
                    .sprite(col * this.candySize, row * this.candySize, 'candies', type)
                    .setOrigin(0)
                    .setScale(this.candyScale);
                candy.setInteractive();
                candy.candyType = type;
                candy.row = row;
                candy.col = col;
                this.candies[row][col] = candy;
                this.add(candy);
            });
        });
        window.auto = false;
        this.setSize(this.candySize * this.gridSize.x, this.candySize * this.gridSize.y);
        this.setPosition(config.x - this.width / 2, config.y - this.height / 2 - this.height / 4);
        this.scene.input.on('gameobjectdown', this.onCandyClicked, this);

        this.candyActive = this.scene.add.graphics();

        this.candyActive.lineStyle(5, 0xff0000);
        this.candyActive.strokeRect(0, 0, this.candySize, this.candySize);
        this.candyActive.setVisible(false);
        this.candyActive.setDepth(999);
        const color = this.scene.sys.game.config.backgroundColor;

        const backgroundColorInt = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.veli = this.scene.add
            .rectangle(0, 0, this.gridSize.x * this.candySize, this.candySize * this.numRow, backgroundColorInt)
            .setOrigin(0)
            .setAlpha(0.5);
        this.add([this.veli, this.candyActive]);

        this.checkMatches();
    }
    handleServer() {
        this.isMyTurn = !!this.socket.isMyTurn;
        this.socket.on('updateInGame', ({ swap }) => {
            this.swapCandies(swap[0], swap[1]);
            this.isMyTurn = true;
        });
        this.socket.on('getRandom', ({ arrTemp }) => {
            this.arrTemp = arrTemp;
            // this.candies.forEach((match) => {
            //     match.forEach((candy) => {
            //         if (candy.row < this.numRow) {
            //             candy.destroy();
            //             this.candies[candy.row][candy.col] = null;
            //         }
            //     });
            // });

            // arrTemp.forEach((itemRow, row) => {
            //     itemRow.forEach((type, col) => {
            //         if (row < this.numRow) {
            //             this.candies[row][col].destroy();
            //             const candy = this.scene.add
            //                 .sprite(col * this.candySize, row * this.candySize, 'candies', type)
            //                 .setOrigin(0)
            //                 .setScale(this.candyScale);
            //             candy.setInteractive();
            //             candy.candyType = type;
            //             candy.row = row;
            //             candy.col = col;
            //             this.candies[row][col] = candy;
            //             this.addAt(candy, 0);
            //         }
            //     });
            // });
        });
    }
    onCandyClicked(pointer, candy) {
        if (!this.isAnimation && candy.row >= this.numRow && this.isMyTurn) {
            if (!this.selectedCandy) {
                this.selectedCandy = candy;
                this.candyActive.setPosition(candy.x, candy.y);
                this.candyActive.setVisible(true);
            } else if (this.selectedCandy == candy) {
                this.selectedCandy = null;
                this.candyActive.setVisible(false);
            } else {
                if (this.handleCheckNear(this.selectedCandy, candy)) {
                    this.isMyTurn = false;
                    this.swapCandies(this.selectedCandy, candy);
                    this.selectedCandy = null;
                }
            }
        }
    }
    handleCheckNear(select, select2) {
        const dx = Math.abs(select.x - select2.x);
        const dy = Math.abs(select.y - select2.y);

        const isAdjacent = (dx === this.candySize && dy === 0) || (dy === this.candySize && dx === 0);

        return isAdjacent;
    }
    reloadCandy() {
        this.candies.forEach((match) => {
            match.forEach((candy) => {
                if (candy.row >= this.numRow) {
                    candy.destroy();
                    this.candies[candy.row][candy.col] = null;
                }
            });
        });
        this.refillCandies();
    }
    findMatches() {
        const grid = this.candies;
        const matches = [];
        const numRows = grid.length;
        const numCols = grid[0].length;

        // Tạo mảng boolean để đánh dấu các khối đã thuộc nhóm match
        const marked = Array.from({ length: numRows }, () => Array(numCols).fill(false));

        // Kiểm tra theo hàng ngang
        for (let row = this.numRow; row < numRows; row++) {
            for (let col = 0; col < numCols - 2; col++) {
                const currentType = grid[row][col].candyType;

                // Xác định nhóm match theo chiều ngang
                if (currentType === grid[row][col + 1].candyType && currentType === grid[row][col + 2].candyType) {
                    const matchGroup = [];
                    let matchCol = col;

                    while (matchCol < numCols && grid[row][matchCol].candyType === currentType) {
                        if (!marked[row][matchCol]) {
                            matchGroup.push(grid[row][matchCol]);
                            marked[row][matchCol] = true; // Đánh dấu khối đã kiểm tra
                        }
                        matchCol++;
                    }

                    if (matchGroup.length > 0) {
                        matches.push(matchGroup);
                    }

                    col = matchCol - 1; // Bỏ qua các cột đã kiểm tra
                }
            }
        }

        // Kiểm tra theo cột dọc
        for (let col = 0; col < numCols; col++) {
            for (let row = this.numRow; row < numRows - 2; row++) {
                const currentType = grid[row][col].candyType;

                // Xác định nhóm match theo chiều dọc
                if (currentType === grid[row + 1][col].candyType && currentType === grid[row + 2][col].candyType) {
                    const matchGroup = [];
                    let matchRow = row;

                    while (matchRow < numRows && grid[matchRow][col].candyType === currentType) {
                        if (!marked[matchRow][col]) {
                            matchGroup.push(grid[matchRow][col]);
                            marked[matchRow][col] = true; // Đánh dấu khối đã kiểm tra
                        }
                        matchRow++;
                    }

                    if (matchGroup.length > 0) {
                        matches.push(matchGroup);
                    }

                    row = matchRow - 1; // Bỏ qua các hàng đã kiểm tra
                }
            }
        }

        return matches;
    }
    checkMatches() {
        let matches = this.findMatches();
        if (matches.length > 0) {
            this.handleMatches(matches);
        } else {
            let foundCanyMatch = this.canSwapAndMatch();

            while (foundCanyMatch.length == 0) {
                if (foundCanyMatch.length == 0) {
                    this.reloadCandy();
                    foundCanyMatch = this.canSwapAndMatch();
                }
            }
            if (!this.isAnimation && !this.isMyTurn && !this.socket) {
                console.log('Máy 1');
                const swap = foundCanyMatch[Phaser.Math.Between(0, foundCanyMatch.length - 1)];
                setTimeout(() => {
                    this.swapCandies(swap[0], swap[1]);
                    this.isMyTurn = true;
                }, 1000);
            }

            if (!this.isAnimation && this.isMyTurn && window.auto) {
                console.log('Máy 2');

                const swap = foundCanyMatch[foundCanyMatch.length - 1];

                setTimeout(() => {
                    this.swapCandies(swap[0], swap[1]);
                    this.isMyTurn = false;
                }, 1000);
            }
        }
    }
    handleMatches(matches) {
        matches.forEach((match) => {
            match.forEach((candy) => {
                candy.destroy();
                this.candies[candy.row][candy.col] = null;
            });
        });

        this.refillCandies();
    }
    canSwapAndMatch() {
        const grid = this.candies;
        const numRows = grid.length;
        const numCols = grid[0].length;
        const possibleSwaps = [];

        // Hàm kiểm tra nhóm match trong lưới sau khi đổi chỗ
        const checkMatch = (row, col) => {
            const currentType = grid[row][col].candyType;

            // Kiểm tra hàng ngang
            let countHorizontal = 1;
            let startCol = col;
            let endCol = col;

            for (let i = col - 1; i >= 0 && grid[row][i].candyType === currentType; i--) {
                countHorizontal++;
                startCol = i;
            }
            for (let i = col + 1; i < numCols && grid[row][i].candyType === currentType; i++) {
                countHorizontal++;
                endCol = i;
            }

            // Kiểm tra cột dọc
            let countVertical = 1;
            let startRow = row;
            let endRow = row;

            for (let i = row - 1; i >= this.numRow && grid[i][col].candyType === currentType; i--) {
                countVertical++;
                startRow = i;
            }
            for (let i = row + 1; i < numRows && grid[i][col].candyType === currentType; i++) {
                countVertical++;
                endRow = i;
            }

            // Chỉ trả về true nếu nhóm match nằm từ hàng 5 trở đi
            return (countHorizontal >= 3 && startCol >= 0) || (countVertical >= 3 && startRow >= 5);
        };

        // Thử đổi các cặp khối liền kề
        for (let row = this.numRow; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                // Đổi chỗ với khối bên phải
                if (col < numCols - 1) {
                    [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]];

                    if (checkMatch(row, col) || checkMatch(row, col + 1)) {
                        possibleSwaps.push([
                            { row: row, col: col },
                            { row: row, col: col + 1 },
                        ]);
                    }

                    // Đổi lại chỗ sau khi kiểm tra
                    [grid[row][col], grid[row][col + 1]] = [grid[row][col + 1], grid[row][col]];
                }

                // Đổi chỗ với khối phía dưới
                if (row < numRows - 1) {
                    [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]];

                    if (checkMatch(row, col) || checkMatch(row + 1, col)) {
                        possibleSwaps.push([
                            { row: row, col: col },
                            { row: row + 1, col: col },
                        ]);
                    }

                    // Đổi lại chỗ sau khi kiểm tra
                    [grid[row][col], grid[row + 1][col]] = [grid[row + 1][col], grid[row][col]];
                }
            }
        }

        return possibleSwaps;
    }

    swapCandies(posC1, posC2, one = false) {
        const candy1 = this.candies[posC1.row][posC1.col];
        const candy2 = this.candies[posC2.row][posC2.col];

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

        this.scene.tweens.add({
            targets: candy1,
            x: candy1.col * this.candySize,
            y: candy1.row * this.candySize,
            duration: this.smoot / 2,
            onComplete: () => {
                this.isAnimation = false;
                this.candyActive.setVisible(false);
                const found = this.findMatches();
                if (found.length == 0 && !one) {
                    this.swapCandies(candy2, candy1, true);
                    this.isMyTurn = true;
                    return;
                }
                if (!this.isMyTurn) {
                    if (this.socket) {
                        const swap1 = (({ row, col }) => ({ row, col }))(candy1);
                        const swap2 = (({ row, col }) => ({ row, col }))(candy2);
                        const swap = [swap1, swap2];
                        var arrCandy = [];
                        const rows = 8;
                        const cols = 8;
                        for (let i = 0; i < rows * 2; i++) {
                            arrCandy[i] = [];
                            for (let j = 0; j < cols; j++) {
                                arrCandy[i][j] = Phaser.Math.Between(0, 5);
                            }
                        }
                        this.arrTemp = arrCandy;
                        this.socket.emit('setRandom', { roomID: this.socket.roomID, arrTemp: this.arrTemp });

                        this.socket.emit('inputInGame', { swap: swap, roomID: this.socket.roomID });
                    }
                }

                this.checkMatches();
            },
            onStart: () => {
                this.isAnimation = true;
            },
        });

        this.scene.tweens.add({
            targets: candy2,
            x: candy2.col * this.candySize,
            y: candy2.row * this.candySize,
            duration: this.smoot / 2,
        });
    }

    refillCandies() {
        for (let col = 0; col < this.gridSize.x; col++) {
            let emptySpaces = 0;
            for (let row = this.gridSize.y - 1; row >= 0; row--) {
                if (this.candies[row][col] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    this.candies[row + emptySpaces][col] = this.candies[row][col];
                    this.candies[row + emptySpaces][col].row = row + emptySpaces;
                    this.candies[row][col] = null;

                    this.scene.tweens.add({
                        targets: this.candies[row + emptySpaces][col],
                        y: (row + emptySpaces) * this.candySize,
                        duration: this.smoot,
                    });
                }
            }
            for (let row = 0; row < emptySpaces; row++) {
                let type;
                if (this.socket) {
                    type = this.arrTemp[row][col];
                    // while (JSON.stringify(this.arrTemp) != JSON.stringify(this.temp)) {

                    //     console.log(type);

                    //     this.temp = this.arrTemp;
                    // }
                } else {
                    type = Phaser.Math.Between(0, 5);
                }
                const candy = this.scene.add
                    .sprite(col * this.candySize, row * this.candySize, 'candies', type)
                    .setOrigin(0)
                    .setScale(this.candyScale);
                candy.setInteractive();

                candy.candyType = type;
                candy.row = row;
                candy.col = col;
                this.candies[row][col] = candy;
                // this.scene.tweens.add({
                //     targets: candy,
                //     y: candy.row * this.candySize,
                //     duration: this.smoot,
                //     onStart: () => {
                //         this.isAnimation = true;
                //     },
                //     onComplete: () => {
                //         this.isAnimation = false;
                //     },
                // });
                this.addAt(candy, 0);
            }
        }

        this.scene.time.delayedCall(800, this.checkMatches, [], this);
    }
    static preload(scene) {
        scene.load.spritesheet('candies', 'assets/sprites/candy.jpeg', {
            frameWidth: Broad.candySize,
            frameHeight: Broad.candySize,
        });
    }
}

export default Broad;
