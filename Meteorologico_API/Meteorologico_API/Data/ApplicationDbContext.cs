using Microsoft.EntityFrameworkCore;
using Meteorologico_API.Models;

namespace Meteorologico_API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Location> Locations { get; set; }
        public DbSet<Param> Params { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Measurement> Measurements { get; set; }
        public DbSet<RecentValue> RecentValues { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Supabase preserva el case de SQL Server: columnas en MAYÚSCULAS, tablas en minúsculas.
            ConfigureLocations(modelBuilder);
            ConfigureParams(modelBuilder);
            ConfigureTags(modelBuilder);
            ConfigureMeasurements(modelBuilder);
            ConfigureRecentValues(modelBuilder);
            ConfigureComments(modelBuilder);
        }

        private static void ConfigureLocations(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Location>(entity =>
            {
                entity.ToTable("locations");
                entity.HasKey(l => l.LocId);

                entity.Property(l => l.LocId).HasColumnName("LOCID");
                entity.Property(l => l.ParentLocId).HasColumnName("PARENTLOCID");
                entity.Property(l => l.LocName).HasColumnName("LOCNAME");
                entity.Property(l => l.LocCode).HasColumnName("LOCCODE");
                entity.Property(l => l.DaqCode).HasColumnName("DAQCODE");
            });
        }

        private static void ConfigureParams(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Param>(entity =>
            {
                entity.ToTable("params");
                entity.HasKey(p => p.ParId);

                entity.Property(p => p.ParId).HasColumnName("PARID");
                entity.Property(p => p.ParCode).HasColumnName("PARCODE");
                entity.Property(p => p.ParName).HasColumnName("PARNAME");
                entity.Property(p => p.Unit).HasColumnName("UNIT");
                entity.Property(p => p.DispFactor).HasColumnName("DISPFACTOR");
                entity.Property(p => p.DispOffset).HasColumnName("DISPOFFSET");
                entity.Property(p => p.DispUnit).HasColumnName("DISPUNIT");
            });
        }

        private static void ConfigureTags(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.ToTable("tags");
                entity.HasKey(t => t.TagId);

                entity.Property(t => t.TagId).HasColumnName("TAGID");
                entity.Property(t => t.LocId).HasColumnName("LOCID");
                entity.Property(t => t.ParId).HasColumnName("PARID");
                entity.Property(t => t.TagName).HasColumnName("TAGNAME");
                entity.Property(t => t.TagCode).HasColumnName("TAGCODE");
                entity.Property(t => t.LoLoLim).HasColumnName("LOLOLIM");
                entity.Property(t => t.LoLim).HasColumnName("LOLIM");
                entity.Property(t => t.HiLim).HasColumnName("HILIM");
                entity.Property(t => t.HiHiLim).HasColumnName("HIHILIM");
                entity.Property(t => t.MinRange).HasColumnName("MINRANGE");
                entity.Property(t => t.MaxRange).HasColumnName("MAXRANGE");

                entity.HasOne(t => t.Location)
                    .WithMany(l => l.Tags)
                    .HasForeignKey(t => t.LocId);

                entity.HasOne(t => t.Param)
                    .WithMany(p => p.Tags)
                    .HasForeignKey(t => t.ParId);
            });
        }

        private static void ConfigureMeasurements(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Measurement>(entity =>
            {
                entity.ToTable("measurements");
                entity.HasKey(m => new { m.TagId, m.TimeOfMeasurement });

                entity.Property(m => m.TagId).HasColumnName("TAGID");
                entity.Property(m => m.TimeOfMeasurement).HasColumnName("TIMEOFMEASUREMENT");
                entity.Property(m => m.MeasuredValue).HasColumnName("MEASUREDVALUE");

                entity.HasOne(m => m.Tag)
                    .WithMany(t => t.Measurements)
                    .HasForeignKey(m => m.TagId);
            });
        }

        private static void ConfigureRecentValues(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RecentValue>(entity =>
            {
                entity.ToTable("recentvalues");
                entity.HasKey(r => new { r.TagId, r.TimeOfMeasurement });

                entity.Property(r => r.TagId).HasColumnName("TAGID");
                entity.Property(r => r.TimeOfMeasurement).HasColumnName("TIMEOFMEASUREMENT");
                entity.Property(r => r.MeasuredValue).HasColumnName("MEASUREDVALUE");

                entity.HasOne(r => r.Tag)
                    .WithMany(t => t.RecentValues)
                    .HasForeignKey(r => r.TagId);
            });
        }

        private static void ConfigureComments(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("comments");
                entity.HasKey(c => new { c.LocId, c.TimeOfComment });

                entity.Property(c => c.LocId).HasColumnName("LOCID");
                entity.Property(c => c.TimeOfComment).HasColumnName("TIMEOFCOMMENT");
                entity.Property(c => c.CommentText).HasColumnName("COMMENT");

                entity.HasOne(c => c.Location)
                    .WithMany(l => l.Comments)
                    .HasForeignKey(c => c.LocId);
            });
        }
    }
}
