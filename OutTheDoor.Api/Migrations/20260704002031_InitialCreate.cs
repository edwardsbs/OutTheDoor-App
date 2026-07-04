using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OutTheDoor.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "outthedoor");

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "outthedoor",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Scenarios",
                schema: "outthedoor",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DefaultLeaveTime = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    BufferMinutes = table.Column<int>(type: "int", nullable: false),
                    AutoStart = table.Column<bool>(type: "bit", nullable: false),
                    AlertMinutes = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scenarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Scenarios_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "outthedoor",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScenarioTasks",
                schema: "outthedoor",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScenarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsOptional = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabledByDefault = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScenarioTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScenarioTasks_Scenarios_ScenarioId",
                        column: x => x.ScenarioId,
                        principalSchema: "outthedoor",
                        principalTable: "Scenarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Scenarios_UserId",
                schema: "outthedoor",
                table: "Scenarios",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ScenarioTasks_ScenarioId",
                schema: "outthedoor",
                table: "ScenarioTasks",
                column: "ScenarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                schema: "outthedoor",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScenarioTasks",
                schema: "outthedoor");

            migrationBuilder.DropTable(
                name: "Scenarios",
                schema: "outthedoor");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "outthedoor");
        }
    }
}
