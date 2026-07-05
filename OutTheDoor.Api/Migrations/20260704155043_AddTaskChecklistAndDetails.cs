using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OutTheDoor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskChecklistAndDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Checklist",
                schema: "outthedoor",
                table: "ScenarioTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Details",
                schema: "outthedoor",
                table: "ScenarioTasks",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                schema: "outthedoor",
                table: "ScenarioTasks",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Checklist",
                schema: "outthedoor",
                table: "ScenarioTasks");

            migrationBuilder.DropColumn(
                name: "Details",
                schema: "outthedoor",
                table: "ScenarioTasks");

            migrationBuilder.DropColumn(
                name: "Instructions",
                schema: "outthedoor",
                table: "ScenarioTasks");
        }
    }
}
