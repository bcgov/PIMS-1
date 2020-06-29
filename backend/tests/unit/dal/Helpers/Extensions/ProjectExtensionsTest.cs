using Xunit;
using Pims.Dal.Entities;
using Pims.Dal.Helpers.Extensions;
using System.Diagnostics.CodeAnalysis;
using Pims.Core.Test;
using Pims.Core.Extensions;
using System;
using FluentAssertions;

namespace Pims.Dal.Test.Helpers.Extensions
{
    [Trait("category", "unit")]
    [Trait("category", "dal")]
    [Trait("category", "extensions")]
    [Trait("group", "project")]
    [ExcludeFromCodeCoverage]
    public class ProjectExtensionsTest
    {
        #region Tests
        #region GetProjectFinancialDate
        [Fact]
        public void GetProjectFinancialDate_NoEvaluations()
        {
            // Arrange
            var project = EntityHelper.CreateProject(1);
            var parcel = EntityHelper.CreateParcel(1);
            var buildings = EntityHelper.CreateBuildings(parcel, 1, 10);
            buildings.ForEach(b => project.AddProperty(b));

            // Act
            var result = project.GetProjectFinancialDate();

            // Assert
            result.Should().NotBeAfter(DateTime.UtcNow);
        }

        [Fact]
        public void GetProjectFinancialDate()
        {
            // Arrange
            var project = EntityHelper.CreateProject(1);
            var parcel = EntityHelper.CreateParcel(1);
            var buildings = EntityHelper.CreateBuildings(parcel, 1, 10);
            var evaluations = EntityHelper.CreateEvaluations(buildings.Next(0), new DateTime(2015, 1, 1), 5);
            buildings.ForEach(b => project.AddProperty(b));

            // Act
            var result = project.GetProjectFinancialDate();

            // Assert
            Assert.Equal(new DateTime(2019, 1, 1), result);
        }
        #endregion

        #region UpdateProjectFinancials
        [Fact]
        public void UpdateProjectFinancials()
        {
            // Arrange
            var project = EntityHelper.CreateProject(1);
            project.FiscalYear = 2019;
            var parcel = EntityHelper.CreateParcel(1);
            EntityHelper.CreateEvaluations(parcel, new DateTime(2015, 1, 1), 5, EvaluationKeys.Assessed, 5);
            EntityHelper.CreateFiscals(parcel, new[] { 2015, 2016, 2017, 2018, 2019 }, FiscalKeys.Estimated, 5);
            EntityHelper.CreateFiscals(parcel, new[] { 2015, 2016, 2017, 2018, 2019 }, FiscalKeys.NetBook, 5);
            var buildings = EntityHelper.CreateBuildings(parcel, 1, 10);
            EntityHelper.CreateEvaluations(buildings.Next(0), new DateTime(2015, 1, 1), 5, EvaluationKeys.Assessed, 5);
            EntityHelper.CreateFiscals(buildings.Next(0), new[] { 2015, 2016, 2017, 2018, 2019 }, FiscalKeys.Estimated, 5);
            EntityHelper.CreateFiscals(buildings.Next(0), new[] { 2015, 2016, 2017, 2018, 2019 }, FiscalKeys.NetBook, 5);

            project.AddProperty(parcel);
            buildings.ForEach(b => project.AddProperty(b));

            // Act
            project.UpdateProjectFinancials();

            // Assert
            project.Estimated.Should().Be(10);
            project.NetBook.Should().Be(10);
            project.Assessed.Should().Be(10);
        }
        #endregion
    #endregion
    }
}
