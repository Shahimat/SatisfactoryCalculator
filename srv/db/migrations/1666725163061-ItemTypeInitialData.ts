import { MigrationInterface, QueryRunner } from 'typeorm';

export class ItemTypeInitialData1666725163061 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO item_type (id, name)
      VALUES (0, "Твердое тело"), (1, "Жидкость");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM item_type;`);
  }
}
